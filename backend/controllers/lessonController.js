import { z } from "zod";
import { readPlaylist, videoId } from "../services/youtubeService.js";
import Lesson from "../models/Lesson.js";
import Course from "../models/Course.js";
import Enrollment from "../models/Enrollment.js";
import { ownedCourse } from "./courseController.js";
import { lessonSchema } from "../middleware/validation.js";
import { AppError } from "../middleware/errors.js";
import {
  saveResource,
  loadResource,
  removeResource,
} from "../services/resourceService.js";

export async function canLearn(courseId, user) {
  const course = await Course.findById(courseId);
  if (!course) throw new AppError(404, "This course could not be found.");
  if (user.role === "admin" || String(course.instructor) === String(user._id))
    return course;
  if (!(await Enrollment.exists({ course: courseId, student: user._id })))
    throw new AppError(403, "Enroll in this course to access its lessons.");
  return course;
}
export async function refreshProgress(courseId) {
  const lessons = await Lesson.find({ course: courseId }).select("_id");
  const ids = new Set(lessons.map((l) => String(l._id)));
  const enrollments = await Enrollment.find({ course: courseId });
  if (enrollments.length)
    await Enrollment.bulkWrite(
      enrollments.map((e) => {
        const completedLessons = e.completedLessons.filter((id) =>
          ids.has(String(id)),
        );
        return {
          updateOne: {
            filter: { _id: e._id },
            update: {
              $set: {
                completedLessons,
                progress: ids.size
                  ? Math.round((completedLessons.length / ids.size) * 100)
                  : 0,
              },
            },
          },
        };
      }),
    );
}
export async function getLessons(req, res) {
  await canLearn(req.params.id, req.user);
  const lessons = await Lesson.find({ course: req.params.id })
    .sort({ order: 1, createdAt: 1 })
    .lean();
  res.json({
    lessons: lessons.map((l) => ({
      ...l,
      resource: l.resource?.key
        ? { name: l.resource.name, size: l.resource.size }
        : null,
    })),
  });
}
export async function createLesson(req, res) {
  const course = await ownedCourse(req.params.id, req.user);
  const input = lessonSchema.parse(req.body);
  const resource = req.file ? await saveResource(req.file) : undefined;
  let lesson;
  try {
    lesson = await Lesson.create({ ...input, course: course._id, resource });
  } catch (error) {
    if (resource) await removeResource(resource).catch(() => {});
    throw error;
  }
  await refreshProgress(course._id);
  res.status(201).json({ lesson });
}
export async function updateLesson(req, res) {
  const lesson = await Lesson.findById(req.params.id);
  if (!lesson) throw new AppError(404, "Lesson not found.");
  await ownedCourse(lesson.course, req.user);
  const input = lessonSchema.parse(req.body);
  const oldResource = lesson.resource?.key ? lesson.resource.toObject() : null;
  const replacement = req.file ? await saveResource(req.file) : null;
  Object.assign(lesson, input);
  if (replacement) lesson.resource = replacement;
  try {
    await lesson.save();
  } catch (error) {
    if (replacement) await removeResource(replacement).catch(() => {});
    throw error;
  }
  if (replacement && oldResource)
    await removeResource(oldResource).catch(() => {});
  res.json({ lesson });
}
export async function deleteLesson(req, res) {
  const lesson = await Lesson.findById(req.params.id);
  if (!lesson) throw new AppError(404, "Lesson not found.");
  await ownedCourse(lesson.course, req.user);
  await lesson.deleteOne();
  await refreshProgress(lesson.course);
  await removeResource(lesson.resource).catch(() => {});
  res.json({ message: "Lesson deleted." });
}
export async function downloadLesson(req, res) {
  const lesson = await Lesson.findById(req.params.id);
  if (!lesson?.resource?.key)
    throw new AppError(404, "This lesson does not have a PDF resource.");
  await canLearn(lesson.course, req.user);
  const content = await loadResource(lesson.resource);
  res.set({
    "Content-Type": "application/pdf",
    "Content-Disposition": `attachment; filename="${lesson.resource.name}"`,
    "Cache-Control": "private, no-store",
  });
  res.send(content);
}

export async function importPlaylist(req, res) {
  const course = await ownedCourse(req.params.id, req.user);
  const { playlistUrl } = z
    .object({ playlistUrl: z.string().max(500) })
    .strict()
    .parse(req.body);
  const { lessons, skipped } = await readPlaylist(playlistUrl);
  const existing = await Lesson.find({ course: course._id }).select(
    "videoUrl order",
  );
  const urls = new Set(
    existing.map((lesson) => videoId(lesson.videoUrl)).filter(Boolean),
  );
  let order = Math.max(0, ...existing.map((lesson) => lesson.order));
  const additions = lessons
    .filter((lesson) => {
      const id = videoId(lesson.videoUrl);
      if (urls.has(id)) return false;
      urls.add(id);
      return true;
    })
    .map((lesson) => ({ ...lesson, order: ++order, course: course._id }));
  if (order > 1000)
    throw new AppError(400, "A course can contain up to 1,000 lessons.");
  if (additions.length) await Lesson.insertMany(additions);
  course.playlistUrl = playlistUrl;
  if (!course.sourceAuthor) course.sourceAuthor = lessons[0].sourceAuthor;
  if (!course.previewVideoUrl) course.previewVideoUrl = lessons[0].videoUrl;
  await course.save();
  await refreshProgress(course._id);
  res.json({
    added: additions.length,
    skipped,
    message: `${additions.length} new lessons imported. ${skipped} unavailable videos skipped. Existing lessons were kept.`,
  });
}
