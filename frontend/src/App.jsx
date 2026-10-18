import { useEffect, lazy, Suspense } from "react";
import { Routes, Route, Navigate, Link, useLocation } from "react-router-dom";
import { AuthProvider, useAuth, dashboardFor } from "./context/AuthContext";
import { PublicLayout, DashboardLayout } from "./components/Layout";
import ProtectedRoute from "./routes/ProtectedRoute";
import NetworkStatus from "./components/NetworkStatus";
import { Loading } from "./components/Shared";

const Home = lazy(() => import("./pages/Home"));
const Courses = lazy(() => import("./pages/Courses"));
const CourseDetail = lazy(() => import("./pages/CourseDetail"));
const Auth = lazy(() => import("./pages/Auth"));
const ForgotPassword = lazy(() => import("./pages/ForgotPassword"));
const TeacherApprovals = lazy(() => import("./pages/TeacherApprovals"));
const LearningPaths = lazy(() =>
  import("./pages/LearningPages").then((module) => ({
    default: module.LearningPaths,
  })),
);
const Teach = lazy(() =>
  import("./pages/LearningPages").then((module) => ({ default: module.Teach })),
);
const StudyGuide = lazy(() =>
  import("./pages/LearningPages").then((module) => ({
    default: module.StudyGuide,
  })),
);
const StudentDashboard = lazy(() => import("./pages/StudentDashboard"));
const ManageCourses = lazy(() => import("./pages/ManageCourses"));
const CourseEditor = lazy(() => import("./pages/CourseEditor"));
const LessonEditor = lazy(() => import("./pages/LessonEditor"));
const AdminDashboard = lazy(() => import("./pages/AdminDashboard"));
const ManageUsers = lazy(() => import("./pages/ManageUsers"));
const Learn = lazy(() => import("./pages/Learn"));
const About = lazy(() =>
  import("./pages/PublicPages").then((module) => ({ default: module.About })),
);
const Contact = lazy(() =>
  import("./pages/PublicPages").then((module) => ({ default: module.Contact })),
);
const Help = lazy(() =>
  import("./pages/PublicPages").then((module) => ({ default: module.Help })),
);
const HowItWorks = lazy(() =>
  import("./pages/PublicPages").then((module) => ({
    default: module.HowItWorks,
  })),
);
const ManageMessages = lazy(() => import("./pages/ManageMessages"));
function DashboardRedirect() {
  const { user, loading } = useAuth();
  return loading ? <Loading /> : <Navigate to={dashboardFor(user)} replace />;
}
function ScrollReset() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}
function NotFound() {
  return (
    <div className="standalone-state">
      <span className="eyebrow">404 / A SMALL DETOUR</span>
      <h1>This page took a different path.</h1>
      <p>Let’s get you back to something worth learning.</p>
      <Link to="/courses" className="btn btn-primary">
        Explore courses
      </Link>
    </div>
  );
}
export default function App() {
  return (
    <AuthProvider>
      <ScrollReset />
      <NetworkStatus />
      <Suspense fallback={<Loading label="Opening your next chapter…" />}>
        <Routes>
          <Route element={<PublicLayout />}>
            <Route index element={<Home />} />
            <Route path="about" element={<About />} />
            <Route path="contact" element={<Contact />} />
            <Route path="help" element={<Help />} />
            <Route path="how-it-works" element={<HowItWorks />} />
            <Route path="learning-paths" element={<LearningPaths />} />
            <Route path="teach" element={<Teach />} />
            <Route path="study-guide" element={<StudyGuide />} />
            <Route path="courses" element={<Courses />} />
            <Route path="courses/:id" element={<CourseDetail />} />
            <Route path="login" element={<Auth key="login" />} />
            <Route path="forgot-password" element={<ForgotPassword />} />
            <Route path="register" element={<Auth register key="register" />} />
            <Route path="*" element={<NotFound />} />
          </Route>
          <Route path="dashboard" element={<DashboardRedirect />} />
          <Route element={<ProtectedRoute />}>
            <Route path="learn/:id" element={<Learn />} />
          </Route>
          {["student", "instructor", "admin"].map((role) => (
            <Route key={role} element={<ProtectedRoute roles={[role]} />}>
              <Route path={`dashboard/${role}`} element={<DashboardLayout />}>
                <Route
                  index
                  element={
                    role === "student" ? (
                      <StudentDashboard />
                    ) : role === "admin" ? (
                      <AdminDashboard />
                    ) : (
                      <ManageCourses overview />
                    )
                  }
                />
                <Route
                  path="courses"
                  element={
                    role === "student" ? (
                      <StudentDashboard coursesOnly />
                    ) : (
                      <ManageCourses />
                    )
                  }
                />
                {role !== "student" && (
                  <>
                    <Route
                      path="courses/new"
                      element={<CourseEditor key="new" />}
                    />
                    <Route path="courses/:id/edit" element={<CourseEditor />} />
                    <Route
                      path="courses/:id/lessons"
                      element={<LessonEditor />}
                    />
                  </>
                )}
                {role === "admin" && (
                  <>
                    <Route path="users" element={<ManageUsers />} />
                    <Route path="teachers" element={<TeacherApprovals />} />
                    <Route path="messages" element={<ManageMessages />} />
                  </>
                )}
              </Route>
            </Route>
          ))}
        </Routes>
      </Suspense>
    </AuthProvider>
  );
}
