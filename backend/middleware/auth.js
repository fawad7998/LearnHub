import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import User from "../models/User.js";
import { AppError } from "./errors.js";
import {
  needsTeacherApproval,
  teacherApprovalMessage,
} from "../services/accountService.js";

export async function authenticate(req, res, next) {
  const token = req.headers.authorization?.startsWith("Bearer ")
    ? req.headers.authorization.slice(7)
    : null;
  if (!token) throw new AppError(401, "Please sign in to continue.");
  let payload;
  try {
    payload = jwt.verify(token, process.env.JWT_SECRET, {
      algorithms: ["HS256"],
      issuer: "learnhub",
      audience: "learnhub-web",
    });
  } catch {
    throw new AppError(401, "Your session has expired. Please sign in again.");
  }
  if (!mongoose.isValidObjectId(payload.sub))
    throw new AppError(401, "Invalid session.");
  const user = await User.findById(payload.sub).select("+authVersion");
  if (!user || !user.isActive || user.authVersion !== payload.version)
    throw new AppError(
      401,
      "Your session is no longer active. Please sign in again.",
    );
  if (needsTeacherApproval(user)) {
    throw new AppError(401, teacherApprovalMessage(user));
  }
  req.user = user;
  next();
}
export const authorize =
  (...roles) =>
  (req, res, next) => {
    if (!roles.includes(req.user.role))
      throw new AppError(
        403,
        "You do not have permission to perform this action.",
      );
    next();
  };
