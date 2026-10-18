import { Router } from "express";
import multer from "multer";
import rateLimit from "express-rate-limit";
import { authenticate, authorize } from "../middleware/auth.js";
import { validId } from "../middleware/validation.js";
import * as auth from "../controllers/authController.js";
import * as courses from "../controllers/courseController.js";
import * as lessons from "../controllers/lessonController.js";
import * as enrollments from "../controllers/enrollmentController.js";
import * as admin from "../controllers/adminController.js";
import * as messages from "../controllers/messageController.js";
import * as passwords from "../controllers/passwordController.js";
const router = Router();
router.param("id", validId);
const authLimit = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 30,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  message: { message: "Too many sign-in attempts. Try again in 15 minutes." },
});
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 2 * 1024 * 1024, files: 1, fields: 4 },
}).single("resource");
const recoveryLimit = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 8,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  message: {
    message: "Too many recovery requests. Please try again in 15 minutes.",
  },
});
const verificationLimit = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 25,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  message: {
    message: "Too many verification attempts. Please try again in 15 minutes.",
  },
});
router.post(
  "/contact",
  rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 5,
    message: {
      message: "Please wait 15 minutes before sending another message.",
    },
  }),
  messages.createMessage,
);
router.get(
  "/admin/messages",
  authenticate,
  authorize("admin"),
  messages.listMessages,
);
router.patch(
  "/admin/messages/:id",
  authenticate,
  authorize("admin"),
  messages.updateMessage,
);
router.post(
  "/courses/:id/import-playlist",
  authenticate,
  authorize("admin", "instructor"),
  rateLimit({ windowMs: 60 * 1000, limit: 6 }),
  lessons.importPlaylist,
);
router.post("/register", authLimit, auth.register);
router.post("/login", authLimit, auth.login);
router.post("/forgot-password", recoveryLimit, passwords.forgotPassword);
router.post(
  "/verify-reset-code",
  verificationLimit,
  passwords.verifyPasswordCode,
);
router.post("/reset-password", verificationLimit, passwords.resetPassword);
router.get("/me", authenticate, (req, res) => res.json({ user: req.user }));
router.post("/logout", authenticate, auth.logout);
router.get("/courses", courses.listCourses);
router.get("/courses/:id", courses.getCourse);
router.post(
  "/courses",
  authenticate,
  authorize("admin", "instructor"),
  courses.createCourse,
);
router.put(
  "/courses/:id",
  authenticate,
  authorize("admin", "instructor"),
  courses.editCourse,
);
router.delete(
  "/courses/:id",
  authenticate,
  authorize("admin", "instructor"),
  courses.deleteCourse,
);
router.get(
  "/manage/courses",
  authenticate,
  authorize("admin", "instructor"),
  courses.manageCourses,
);
router.get("/courses/:id/lessons", authenticate, lessons.getLessons);
router.post(
  "/courses/:id/lessons",
  authenticate,
  authorize("admin", "instructor"),
  upload,
  lessons.createLesson,
);
router.put(
  "/lessons/:id",
  authenticate,
  authorize("admin", "instructor"),
  upload,
  lessons.updateLesson,
);
router.delete(
  "/lessons/:id",
  authenticate,
  authorize("admin", "instructor"),
  lessons.deleteLesson,
);
router.get("/lessons/:id/resource", authenticate, lessons.downloadLesson);
router.post("/enroll", authenticate, authorize("student"), enrollments.enroll);
router.get(
  "/my-courses",
  authenticate,
  authorize("student"),
  enrollments.myCourses,
);
router.patch(
  "/lessons/:id/complete",
  authenticate,
  authorize("student"),
  enrollments.completeLesson,
);
router.get("/admin/users", authenticate, authorize("admin"), admin.users);
router.get(
  "/admin/teachers",
  authenticate,
  authorize("admin"),
  admin.teacherRequests,
);
router.patch(
  "/admin/teachers/:id/approval",
  authenticate,
  authorize("admin"),
  admin.reviewTeacher,
);
router.patch(
  "/admin/users/:id",
  authenticate,
  authorize("admin"),
  admin.updateUser,
);
router.delete(
  "/admin/users/:id",
  authenticate,
  authorize("admin"),
  admin.deleteUser,
);
router.get(
  "/admin/analytics",
  authenticate,
  authorize("admin"),
  admin.analytics,
);
export default router;
