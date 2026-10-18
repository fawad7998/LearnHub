import mongoose from "mongoose";
import bcrypt from "bcrypt";

const passwordResetSchema = new mongoose.Schema(
  {
    nonce: String,
    codeHash: String,
    tokenHash: String,
    expiresAt: Date,
    requestedAt: Date,
    windowStartedAt: Date,
    requestCount: { type: Number, default: 0 },
    attempts: { type: Number, default: 0 },
  },
  { _id: false },
);

const schema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 80 },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    password: { type: String, required: true, select: false },
    role: {
      type: String,
      enum: ["admin", "instructor", "student"],
      default: "student",
    },
    isActive: { type: Boolean, default: true },
    isDemoAccount: { type: Boolean, default: false },
    teacherApproval: {
      type: String,
      enum: ["approved", "pending", "rejected"],
      default: "approved",
    },
    teacherAppliedAt: Date,
    teacherReviewedAt: Date,
    teacherReviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    passwordReset: { type: passwordResetSchema, select: false },
    authVersion: { type: Number, default: 0, select: false },
  },
  { timestamps: true },
);
schema.index({ role: 1, teacherApproval: 1, createdAt: -1 });
schema.pre("save", async function () {
  if (this.isModified("password"))
    this.password = await bcrypt.hash(this.password, 12);
});
schema.methods.checkPassword = function (candidate) {
  return bcrypt.compare(candidate, this.password);
};
schema.set("toJSON", {
  transform: (_, object) => {
    delete object.password;
    delete object.authVersion;
    delete object.passwordReset;
    delete object.__v;
    return object;
  },
});
export default mongoose.model("User", schema);
