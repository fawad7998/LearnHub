import mongoose from "mongoose";
import { z } from "zod";
import Course from "../models/Course.js";
import Lesson from "../models/Lesson.js";
import Enrollment from "../models/Enrollment.js";
import { AppError } from "../middleware/errors.js";
const enrollmentSchema = z
  .object({
    courseId: z
      .string()
      .refine(mongoose.isValidObjectId, "Select a valid course."),
  })
  .strict();
export async function enroll(req, res) {
  const { courseId } = enrollmentSchema.parse(req.body);
  if (!(await Course.exists({ _id: courseId })))
    throw new AppError(404, "This course could not be found.");
  const enrollment = await Enrollment.create({
    course: courseId,
    student: req.user._id,
  });
  res.status(201).json({
    enrollment,
    message: "You are enrolled. Your next chapter starts here.",
  });
}
export async function myCourses(req, res) {
  const enrollments = await Enrollment.find({ student: req.user._id })
    .populate({
      path: "course",
      populate: { path: "instructor", select: "name" },
    })
    .sort({ updatedAt: -1 })
    .lean();
  res.json({ enrollments: enrollments.filter((e) => e.course) });
}
export async function completeLesson(req, res) {
  const lesson = await Lesson.findById(req.params.id);
  if (!lesson) throw new AppError(404, "Lesson not found.");
  const enrollment = await Enrollment.findOneAndUpdate(
    { student: req.user._id, course: lesson.course },
    { $addToSet: { completedLessons: lesson._id } },
    { returnDocument: "after" },
  );
  if (!enrollment)
    throw new AppError(403, "Enroll in the course before completing lessons.");
  const lessonCount = await Lesson.countDocuments({ course: lesson.course });
  // Atomic update uses the latest completion array, including concurrent clicks.
  const updated = await Enrollment.findByIdAndUpdate(
    enrollment._id,
    [
      {
        $set: {
          progress: {
            $min: [
              100,
              {
                $round: [
                  {
                    $multiply: [
                      {
                        $divide: [
                          { $size: "$completedLessons" },
                          Math.max(lessonCount, 1),
                        ],
                      },
                      100,
                    ],
                  },
                  0,
                ],
              },
            ],
          },
        },
      },
    ],
    { returnDocument: "after", updatePipeline: true },
  );
  res.json({ enrollment: updated });
}
