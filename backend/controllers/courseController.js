import Course from "../models/Course.js";
import Lesson from "../models/Lesson.js";
import Enrollment from "../models/Enrollment.js";
import { courseSchema } from "../middleware/validation.js";
import { AppError } from "../middleware/errors.js";
import { removeResource } from "../services/resourceService.js";

export async function ownedCourse(id, user) {
  const course = await Course.findById(id);
  if (!course) throw new AppError(404, "This course could not be found.");
  if (user.role !== "admin" && String(course.instructor) !== String(user._id))
    throw new AppError(403, "You can only manage your own courses.");
  return course;
}
async function decorate(courses) {
  const ids = courses.map((c) => c._id);
  const counts = await Lesson.aggregate([
    { $match: { course: { $in: ids } } },
    { $group: { _id: "$course", count: { $sum: 1 } } },
  ]);
  return courses.map((course) => ({
    ...course.toJSON(),
    lessonCount:
      counts.find((v) => String(v._id) === String(course._id))?.count || 0,
  }));
}
export async function listCourses(req, res) {
  const filter = {};
  if (req.query.category && typeof req.query.category === "string")
    filter.category = req.query.category;
  if (typeof req.query.q === "string" && req.query.q.trim())
    filter.title = {
      $regex: req.query.q
        .trim()
        .slice(0, 100)
        .replace(/[.*+?^${}()|[\]\\]/g, "\\$&"),
      $options: "i",
    };
  const courses = await Course.find(filter)
    .populate("instructor", "name")
    .sort({ createdAt: -1 })
    .limit(100);
  res.json({ courses: await decorate(courses) });
}
export async function getCourse(req, res) {
  const course = await Course.findById(req.params.id).populate(
    "instructor",
    "name",
  );
  if (!course) throw new AppError(404, "This course could not be found.");
  const lessons = await Lesson.find({ course: course._id })
    .select("title order")
    .sort({ order: 1, createdAt: 1 });
  res.json({ course, lessons });
}
export async function createCourse(req, res) {
  const course = await Course.create({
    ...courseSchema.parse(req.body),
    instructor: req.user._id,
  });
  res.status(201).json({ course });
}
export async function editCourse(req, res) {
  const course = await ownedCourse(req.params.id, req.user);
  Object.assign(course, courseSchema.parse(req.body));
  await course.save();
  res.json({ course });
}
export async function deleteCourse(req, res) {
  const course = await ownedCourse(req.params.id, req.user);
  const lessons = await Lesson.find({ course: course._id });
  await Enrollment.deleteMany({ course: course._id });
  await Lesson.deleteMany({ course: course._id });
  await course.deleteOne();
  await Promise.allSettled(
    lessons
      .filter((l) => l.resource?.key)
      .map((l) => removeResource(l.resource)),
  );
  res.json({ message: "Course and related learning records deleted." });
}
export async function manageCourses(req, res) {
  const courses = await Course.find(
    req.user.role === "admin" ? {} : { instructor: req.user._id },
  )
    .populate("instructor", "name")
    .sort({ createdAt: -1 });
  const enrollments = await Enrollment.aggregate([
    { $match: { course: { $in: courses.map((c) => c._id) } } },
    { $group: { _id: "$course", count: { $sum: 1 } } },
  ]);
  res.json({
    courses: (await decorate(courses)).map((course) => ({
      ...course,
      studentCount:
        enrollments.find((v) => String(v._id) === String(course._id))?.count ||
        0,
    })),
  });
}
