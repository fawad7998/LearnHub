import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import { fileURLToPath } from "node:url";
import router from "./routes/index.js";
import User from "./models/User.js";
import { AppError, errorHandler } from "./middleware/errors.js";
import { mailIsConfigured } from "./services/mailService.js";

dotenv.config({
  path: fileURLToPath(new URL(".env", import.meta.url)),
  quiet: true,
});
const { MONGODB_URI, JWT_SECRET } = process.env;
if (!MONGODB_URI || !/^mongodb(?:\+srv)?:\/\//.test(MONGODB_URI)) {
  throw new Error(
    "Set a valid MONGODB_URI in backend/.env before starting LearnHub.",
  );
}
if (
  !JWT_SECRET ||
  JWT_SECRET.length < 32 ||
  JWT_SECRET.startsWith("replace-with")
) {
  throw new Error(
    "Set JWT_SECRET to a random secret of at least 32 characters in backend/.env.",
  );
}
const port = Number(process.env.PORT || 5000);
if (!mailIsConfigured()) {
  console.warn(
    "Password recovery is unavailable until SMTP_HOST, SMTP_USER and SMTP_PASS are set in backend/.env.",
  );
}
if (!Number.isInteger(port) || port < 1 || port > 65535) {
  throw new Error("PORT must be an integer between 1 and 65535.");
}
const clientOrigins = (process.env.CLIENT_URL || "http://localhost:5173")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

try {
  await mongoose.connect(MONGODB_URI, {
    maxPoolSize: 5,
    serverSelectionTimeoutMS: 10000,
  });
  console.log(`MongoDB connected. Database: ${mongoose.connection.name}`);
} catch {
  throw new Error(
    "MongoDB connection failed. Check MONGODB_URI, database credentials, and network access.",
  );
}

if (
  !process.env.VERCEL &&
  !(await User.exists({ role: "admin", isActive: true }))
) {
  console.warn(
    "No active admin account exists in this database. Run npm run setup from backend, or double-click backend/SETUP_DATABASE.cmd on Windows.",
  );
}

const app = express();
app.disable("x-powered-by");
if (process.env.VERCEL) app.set("trust proxy", 1);
app.use(helmet());
app.use(
  cors({
    origin(origin, callback) {
      if (!origin || clientOrigins.includes(origin))
        return callback(null, true);
      callback(new AppError(403, "This origin is not allowed."));
    },
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  }),
);
app.use(
  rateLimit({
    windowMs: 60 * 1000,
    limit: 180,
    standardHeaders: "draft-8",
    legacyHeaders: false,
    message: { message: "Too many requests. Please try again shortly." },
  }),
);
app.use(express.json({ limit: "100kb" }));
app.get("/health", (req, res) => {
  const connected = mongoose.connection.readyState === 1;
  res.status(connected ? 200 : 503).json({
    status: connected ? "ok" : "unavailable",
    service: "learnhub-api",
    database: connected ? "connected" : "disconnected",
  });
});
app.use(router);
app.use((req, res) =>
  res.status(404).json({ message: "This API route does not exist." }),
);
app.use(errorHandler);

if (!process.env.VERCEL) {
  const server = app.listen(port, () =>
    console.log(`LearnHub API: http://localhost:${port}`),
  );
  async function shutdown() {
    server.close(async () => {
      await mongoose.disconnect();
      process.exit(0);
    });
  }
  process.on("SIGINT", shutdown);
  process.on("SIGTERM", shutdown);
}
export default app;
