import mongoose from "mongoose";

// PDFs are limited to 2 MB. A separate collection keeps file bytes out of lesson
// lists and allows persistent uploads without an additional storage account.
const schema = new mongoose.Schema(
  {
    data: { type: Buffer, required: true, select: false },
  },
  { timestamps: true },
);

export default mongoose.model("Resource", schema);
