import mongoose from "mongoose";

const schema = new mongoose.Schema(
  {
    name: { type: String, required: true, maxlength: 80 },
    email: { type: String, required: true, maxlength: 254 },
    subject: { type: String, required: true, maxlength: 120 },
    message: { type: String, required: true, maxlength: 4000 },
    status: { type: String, enum: ["new", "resolved"], default: "new" },
  },
  { timestamps: true },
);

export default mongoose.model("Message", schema);
