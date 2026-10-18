import jwt from "jsonwebtoken";
import User from "../models/User.js";
import { registerSchema, loginSchema } from "../middleware/validation.js";
import { AppError } from "../middleware/errors.js";
import {
  needsTeacherApproval,
  teacherApprovalMessage,
} from "../services/accountService.js";
function result(user) {
  const token = jwt.sign(
    { version: user.authVersion ?? 0 },
    process.env.JWT_SECRET,
    {
      subject: String(user._id),
      expiresIn: "8h",
      issuer: "learnhub",
      audience: "learnhub-web",
      algorithm: "HS256",
    },
  );
  return { token, user: user.toJSON() };
}
export async function register(req, res) {
  const input = registerSchema.parse(req.body);
  const teacher = input.role === "instructor";
  const user = await User.create({
    ...input,
    teacherApproval: teacher ? "pending" : "approved",
    ...(teacher && { teacherAppliedAt: new Date() }),
  });
  res.status(201).json({
    message: teacher
      ? "Your teacher application has been submitted. An administrator must approve it before you can sign in."
      : "Account created. Please log in.",
    requiresApproval: teacher,
    user: user.toJSON(),
  });
}
export async function login(req, res) {
  const input = loginSchema.parse(req.body);
  const user = await User.findOne({ email: input.email }).select(
    "+password +authVersion",
  );
  if (!user || !user.isActive || !(await user.checkPassword(input.password)))
    throw new AppError(401, "Email or password is incorrect.");
  if (needsTeacherApproval(user)) {
    throw new AppError(403, teacherApprovalMessage(user));
  }
  res.json(result(user));
}
export async function logout(req, res) {
  await User.updateOne({ _id: req.user._id }, { $inc: { authVersion: 1 } });
  res.json({ message: "Signed out from all sessions." });
}
