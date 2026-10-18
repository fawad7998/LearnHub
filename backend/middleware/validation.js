import { z } from "zod";
import mongoose from "mongoose";
import { AppError } from "./errors.js";
import { categories, covers } from "../config/courseOptions.js";
import { videoId, playlistId } from "../services/youtubeService.js";
import { isDemoEmail } from "../services/accountService.js";
const email = z
  .string()
  .trim()
  .toLowerCase()
  .max(254)
  .pipe(z.email("Enter a valid email."));
const videoLink = z
  .string()
  .trim()
  .max(500)
  .refine(
    (v) => !v || videoId(v),
    "Enter a YouTube video link (not just a playlist).",
  )
  .default("");
const playlistLink = z
  .string()
  .trim()
  .max(500)
  .refine((v) => !v || playlistId(v), "Enter a valid YouTube playlist link.")
  .default("");
const password = z
  .string()
  .min(8, "Use at least 8 characters for your password.")
  .refine(
    (v) => Buffer.byteLength(v, "utf8") <= 72,
    "Password must be at most 72 bytes.",
  );
export const registerSchema = z
  .object({
    name: z.string().trim().min(2, "Enter your name.").max(80),
    email: email.refine(
      (value) => !isDemoEmail(value),
      "Use a real email address. Demo email domains cannot register new accounts.",
    ),
    password,
    role: z.enum(["student", "instructor"]).default("student"),
  })
  .strict();
export const loginSchema = z
  .object({
    email,
    password: z.string().min(1, "Enter your password.").max(256),
  })
  .strict();
export const forgotPasswordSchema = z.object({ email }).strict();
export const verifyPasswordCodeSchema = z
  .object({
    email,
    code: z
      .string()
      .trim()
      .regex(/^\d{6}$/, "Enter the six-digit code from your email."),
  })
  .strict();
export const resetPasswordSchema = z
  .object({
    email,
    token: z
      .string()
      .regex(
        /^[a-f0-9]{64}$/,
        "Your verification has expired. Request a new code.",
      ),
    password,
  })
  .strict();
export const courseSchema = z
  .object({
    title: z
      .string()
      .trim()
      .min(3, "Course title needs at least 3 characters.")
      .max(100),
    description: z
      .string()
      .trim()
      .min(20, "Add a description of at least 20 characters.")
      .max(5000),
    category: z.enum(categories),
    price: z.coerce.number().min(0).max(1000000),
    level: z.enum(["Beginner", "Intermediate", "Advanced"]).default("Beginner"),
    duration: z.string().trim().min(1).max(40).default("Self-paced"),
    cover: z.enum(covers).default("react"),
    playlistUrl: playlistLink,
    previewVideoUrl: videoLink,
    sourceAuthor: z.string().trim().max(120).default(""),
    outcomes: z.array(z.string().trim().min(2).max(160)).max(8).default([]),
  })
  .strict();
export const lessonSchema = z
  .object({
    title: z.string().trim().min(3).max(180),
    videoUrl: videoLink,
    content: z.string().trim().max(20000).default(""),
    order: z.coerce.number().int().min(1).max(1000).default(1),
  })
  .strict()
  .refine((v) => v.videoUrl || v.content.length >= 20, {
    message:
      "Add a YouTube video link, or at least 20 characters of lesson notes.",
    path: ["videoUrl"],
  });
export function validId(req, res, next, id) {
  if (!mongoose.isValidObjectId(id))
    throw new AppError(400, "Invalid record ID.");
  next();
}
