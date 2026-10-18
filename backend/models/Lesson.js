import mongoose from "mongoose";
const schema = new mongoose.Schema(
  {
    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
      required: true,
      index: true,
    },
    title: { type: String, required: true, maxlength: 180 },
    content: { type: String, default: "", maxlength: 20000 },
    videoUrl: { type: String, default: "", maxlength: 500 },
    sourceAuthor: { type: String, default: "", maxlength: 120 },
    order: { type: Number, default: 1, min: 1 },
    resource: { key: String, name: String, size: Number },
  },
  { timestamps: true },
);
export default mongoose.model("Lesson", schema);
