import path from "node:path";
import mongoose from "mongoose";
import Resource from "../models/Resource.js";
import { AppError } from "../middleware/errors.js";

export async function saveResource(file) {
  if (
    file.mimetype !== "application/pdf" ||
    file.buffer.subarray(0, 5).toString() !== "%PDF-"
  ) {
    throw new AppError(400, "Only valid PDF documents are supported.");
  }
  const resource = await Resource.create({ data: file.buffer });
  const name =
    path
      .basename(file.originalname)
      .replace(/[^a-zA-Z0-9._ -]/g, "")
      .slice(0, 100) || "lesson.pdf";
  return { key: String(resource._id), name, size: file.size };
}

export async function loadResource(resource) {
  if (!mongoose.isValidObjectId(resource.key)) {
    throw new AppError(
      404,
      "This PDF needs to be uploaded again by the instructor.",
    );
  }
  const file = await Resource.findById(resource.key).select("+data");
  if (!file) throw new AppError(404, "The lesson file could not be found.");
  return Buffer.from(file.data);
}

export async function removeResource(resource) {
  if (resource?.key && mongoose.isValidObjectId(resource.key)) {
    await Resource.findByIdAndDelete(resource.key);
  }
}
