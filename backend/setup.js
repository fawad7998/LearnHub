import mongoose from "mongoose";
import dotenv from "dotenv";
import { fileURLToPath } from "node:url";
import { readFile, appendFile } from "node:fs/promises";
import { randomBytes } from "node:crypto";
import User from "./models/User.js";
import Course from "./models/Course.js";
import Lesson from "./models/Lesson.js";
import { refreshProgress } from "./controllers/lessonController.js";
import { courseSchema, lessonSchema } from "./middleware/validation.js";

dotenv.config({
  path: fileURLToPath(new URL(".env", import.meta.url)),
  quiet: true,
});
const accessFile = new URL("account-access.txt", import.meta.url);

async function createAccount(email, name, role) {
  const existing = await User.findOne({ email });
  if (existing) {
    if (existing.role !== role || !existing.isActive)
      throw new Error(
        `The ${email} account already exists with a different role or is inactive. Resolve it before running setup.`,
      );
    console.log(`${role}: ${email} already exists; its password was kept.`);
    return existing;
  }
  const password = randomBytes(18).toString("base64url");
  const user = new User({ name, email, password, role });
  await appendFile(
    accessFile,
    `${new Date().toISOString()} — ${role}\nDatabase: ${mongoose.connection.name}\nEmail: ${email}\nPassword: ${password}\n\n`,
    { mode: 0o600 },
  );
  await user.save();
  console.log(
    `${role}: ${email} created. Its password is in backend/account-access.txt.`,
  );
  return user;
}

try {
  if (!/^mongodb(?:\+srv)?:\/\//.test(process.env.MONGODB_URI || ""))
    throw new Error("Set MONGODB_URI in backend/.env.");
  const databaseName = decodeURIComponent(
    process.env.MONGODB_URI.match(/^mongodb(?:\+srv)?:\/\/[^/]+\/([^?]*)/)?.[1] || "",
  );
  if (!databaseName || /[<>]/.test(databaseName))
    throw new Error(
      "MONGODB_URI must include your database name, for example /hubData?retryWrites=true&w=majority. Replace the entire <dbname> placeholder.",
    );
  if (
    !process.env.JWT_SECRET ||
    process.env.JWT_SECRET.length < 32 ||
    process.env.JWT_SECRET.startsWith("replace-with")
  )
    throw new Error(
      "Set a random JWT_SECRET of at least 32 characters in backend/.env.",
    );
  const catalog = JSON.parse(
    await readFile(
      new URL("catalog/initial-courses.json", import.meta.url),
      "utf8",
    ),
  );
  for (const { lessons, ...course } of catalog) {
    courseSchema.parse(course);
    for (const lesson of lessons) lessonSchema.parse(lesson);
  }
  console.log(`Connecting to database: ${databaseName}`);
  await mongoose.connect(process.env.MONGODB_URI, {
    serverSelectionTimeoutMS: 10000,
  });
  console.log(`Connected. Database: ${mongoose.connection.name}`);
  console.log(`MongoDB server: ${mongoose.connection.host}`);
  await User.init();
  await createAccount("admin@learnhub.test", "LearnHub Admin", "admin");
  const teacher = await createAccount(
    "teacher@learnhub.test",
    "LearnHub Course Curator",
    "instructor",
  );
  for (const { lessons, ...input } of catalog) {
    let course = await Course.findOne({
      instructor: teacher._id,
      playlistUrl: input.playlistUrl,
    });
    if (!course)
      course = await Course.create({ ...input, instructor: teacher._id });
    const existing = await Lesson.find({ course: course._id }).select(
      "videoUrl order",
    );
    const urls = new Set(existing.map((lesson) => lesson.videoUrl));
    let order = Math.max(0, ...existing.map((lesson) => lesson.order));
    const additions = lessons
      .filter((lesson) => !urls.has(lesson.videoUrl))
      .map((lesson) => ({
        ...lesson,
        sourceAuthor: input.sourceAuthor,
        course: course._id,
        order: ++order,
      }));
    if (additions.length) await Lesson.insertMany(additions);
    await refreshProgress(course._id);
    const savedUrls = await Lesson.distinct("videoUrl", {
      course: course._id,
      videoUrl: { $in: lessons.map((lesson) => lesson.videoUrl) },
    });
    if (savedUrls.length !== lessons.length)
      throw new Error(
        `Could not verify all lessons for ${input.title}. Run setup again to add any missing links.`,
      );
    console.log(
      `${input.title}: ${additions.length} lessons added; ${savedUrls.length} catalog video links verified in MongoDB.`,
    );
  }
  const [users, courses, lessons] = await Promise.all([
    User.countDocuments(),
    Course.countDocuments(),
    Lesson.countDocuments(),
  ]);
  console.log(`\nSETUP COMPLETE - database: ${mongoose.connection.name}`);
  console.table({ users, courses, lessons });
  console.log(
    "No student accounts were created. Existing accounts, courses and progress were preserved.",
  );
  console.log(
    `New account passwords: ${fileURLToPath(accessFile)}`,
  );
  console.log(
    "Admin login: admin@learnhub.test. Use the password saved when this account was first created; setup does not reset passwords.",
  );
  console.log(
    "Start the backend and frontend, then sign in through the website's normal Login page. Admin opens /dashboard/admin.",
  );
  console.log(
    "Refresh MongoDB Compass. Its connection must use the same MongoDB server and database shown above.",
  );
} catch (error) {
  const connectionError =
    /Mongo|ENOTFOUND|ECONNREFUSED|querySrv|ETIMEOUT|EAI_AGAIN/.test(
      `${error.name} ${error.code} ${error.message}`,
    );
  console.error(
    connectionError
      ? "MongoDB setup failed. Check the connection string, database credentials, Atlas Network Access and DNS/network connection."
      : error.message,
  );
  if (connectionError) {
    const code = String(error.code || error.cause?.code || "");
    if (/^[A-Z0-9_]+$/.test(code)) console.error(`Error code: ${code}`);
    if (/querySrv|queryTxt/.test(`${error.syscall} ${error.message}`))
      console.error(
        "The MongoDB DNS lookup failed before a database connection could be established.",
      );
  }
  console.error(
    "Setup did not finish. Keep this output, fix the reported problem, and run setup again. Any records already saved will be kept.",
  );
  process.exitCode = 1;
} finally {
  await mongoose.disconnect();
}
