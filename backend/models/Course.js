import mongoose from "mongoose";
import { categories, covers } from "../config/courseOptions.js";
const schema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true, maxlength: 100 },
    description: { type: String, required: true, maxlength: 5000 },
    instructor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    category: {
      type: String,
      enum: categories,
      required: true,
    },
    price: { type: Number, required: true, min: 0, default: 0 },
    level: {
      type: String,
      enum: ["Beginner", "Intermediate", "Advanced"],
      default: "Beginner",
    },
    duration: { type: String, default: "Self-paced", maxlength: 40 },
    cover: {
      type: String,
      enum: covers,
      default: "react",
    },
    playlistUrl: { type: String, default: "", maxlength: 500 },
    previewVideoUrl: { type: String, default: "", maxlength: 500 },
    sourceAuthor: { type: String, default: "", maxlength: 120 },
    outcomes: { type: [String], default: [] },
  },
  { timestamps: true },
);
schema.index({ instructor: 1 });
export default mongoose.model("Course", schema);
