import { z } from "zod";
import User from "../models/User.js";
import Course from "../models/Course.js";
import Enrollment from "../models/Enrollment.js";
import { AppError } from "../middleware/errors.js";
export async function users(req, res) {
  res.json({ users: await User.find().sort({ createdAt: -1 }).limit(250) });
}
export async function teacherRequests(req, res) {
  const status = z
    .enum(["pending", "rejected"])
    .default("pending")
    .parse(req.query.status);
  const filter = { role: "instructor", teacherApproval: status };
  const [teachers, total] = await Promise.all([
    User.find(filter).sort({ teacherAppliedAt: 1, createdAt: 1 }).limit(100),
    User.countDocuments(filter),
  ]);
  res.json({ teachers, total });
}

export async function reviewTeacher(req, res) {
  const { decision } = z
    .object({ decision: z.enum(["approved", "rejected"]) })
    .strict()
    .parse(req.body);
  const user = await User.findOneAndUpdate(
    {
      _id: req.params.id,
      role: "instructor",
      teacherApproval:
        decision === "approved" ? { $in: ["pending", "rejected"] } : "pending",
    },
    {
      $set: {
        teacherApproval: decision,
        teacherReviewedAt: new Date(),
        teacherReviewedBy: req.user._id,
      },
      $inc: { authVersion: 1 },
    },
    { new: true, runValidators: true },
  );
  if (!user)
    throw new AppError(
      409,
      "This teacher request has already changed. Refresh the list.",
    );
  res.json({
    user,
    message:
      decision === "approved"
        ? user.isActive
          ? `${user.name} is approved and can now sign in as a teacher.`
          : `${user.name} is approved. Activate the paused account in Manage users before they can sign in.`
        : `${user.name}’s application was declined. Dashboard access remains blocked.`,
  });
}
export async function updateUser(req, res) {
  const input = z
    .object({
      role: z.enum(["student", "instructor"]).optional(),
      isActive: z.boolean().optional(),
    })
    .strict()
    .refine((v) => Object.keys(v).length > 0, "No changes supplied.")
    .parse(req.body);
  const user = await User.findById(req.params.id);
  if (!user) throw new AppError(404, "User not found.");
  if (user.role === "admin")
    throw new AppError(
      403,
      "Admin accounts cannot be changed through this screen.",
    );
  if (
    input.role === "student" &&
    (await Course.exists({ instructor: user._id }))
  )
    throw new AppError(
      409,
      "Remove this instructor’s courses before changing their role.",
    );
  Object.assign(user, input);
  if (input.role) {
    user.teacherApproval = "approved";
    user.teacherReviewedAt = new Date();
    user.teacherReviewedBy = req.user._id;
  }
  await user.save();
  await User.updateOne({ _id: user._id }, { $inc: { authVersion: 1 } });
  res.json({ user });
}
export async function deleteUser(req, res) {
  const user = await User.findById(req.params.id);
  if (!user) throw new AppError(404, "User not found.");
  if (user.role === "admin")
    throw new AppError(403, "Admin accounts cannot be deleted here.");
  if (await Course.exists({ instructor: user._id }))
    throw new AppError(409, "Delete this instructor’s courses first.");
  await Enrollment.deleteMany({ student: user._id });
  await user.deleteOne();
  res.json({ message: "User deleted." });
}
export async function analytics(req, res) {
  const [
    students,
    instructors,
    courses,
    enrollments,
    completed,
    popular,
    recent,
    pendingTeachers,
  ] = await Promise.all([
    User.countDocuments({ role: "student" }),
    User.countDocuments({ role: "instructor" }),
    Course.countDocuments(),
    Enrollment.countDocuments(),
    Enrollment.countDocuments({ progress: 100 }),
    Enrollment.aggregate([
      { $group: { _id: "$course", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 6 },
      {
        $lookup: {
          from: "courses",
          localField: "_id",
          foreignField: "_id",
          as: "course",
        },
      },
      { $unwind: "$course" },
      { $project: { count: 1, title: "$course.title" } },
    ]),
    Enrollment.find()
      .populate("student", "name")
      .populate("course", "title")
      .sort({ createdAt: -1 })
      .limit(5),
    User.countDocuments({ role: "instructor", teacherApproval: "pending" }),
  ]);
  res.json({
    stats: {
      students,
      instructors,
      courses,
      enrollments,
      completed,
      pendingTeachers,
    },
    popular,
    recent: recent.filter((e) => e.course && e.student),
  });
}
