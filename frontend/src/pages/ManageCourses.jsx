import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { BookOpen, Users, Layers3, Plus, Pencil, Trash2 } from "lucide-react";
import api, { errorMessage } from "../services/api";
import { useAuth, dashboardFor } from "../context/AuthContext";
import {
  PageIntro,
  Loading,
  ErrorBox,
  EmptyState,
  ConfirmDialog,
  CourseCover,
  SuccessMessage,
  SearchInput,
} from "../components/Shared";
import { Stat } from "./StudentDashboard";
export default function ManageCourses({ overview = false }) {
  const { user } = useAuth();
  const base = dashboardFor(user);
  const [query, setQuery] = useState("");
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [remove, setRemove] = useState(null);
  const [busy, setBusy] = useState(false);
  function load() {
    setLoading(true);
    setError("");
    api
      .get("/manage/courses")
      .then(({ data }) => setCourses(data.courses))
      .catch((e) => setError(errorMessage(e)))
      .finally(() => setLoading(false));
  }
  useEffect(load, []);
  async function deleteCourse() {
    setBusy(true);
    setError("");
    try {
      await api.delete(`/courses/${remove._id}`);
      setMessage("Course deleted successfully.");
      setRemove(null);
      load();
    } catch (e) {
      setError(errorMessage(e));
      setRemove(null);
    } finally {
      setBusy(false);
    }
  }
  const visible = courses.filter((course) =>
    course.title.toLowerCase().includes(query.toLowerCase()),
  );
  return (
    <>
      <PageIntro
        eyebrow={
          overview
            ? "HELP SOMEONE TAKE THEIR NEXT STEP"
            : "YOUR TEACHING COLLECTION"
        }
        title={
          overview
            ? `Hello, ${user.name.split(" ")[0]}.`
            : user.role === "admin"
              ? "All courses"
              : "My courses"
        }
        description={
          overview
            ? "Share what you know. See what your learners achieve."
            : "Create, refine, and organize your learning experiences."
        }
      >
        <Link to={`${base}/courses/new`} className="btn btn-primary">
          <Plus size={18} />
          Create course
        </Link>
      </PageIntro>
      <ErrorBox message={error} />
      {message && <SuccessMessage>{message}</SuccessMessage>}
      {loading ? (
        <Loading />
      ) : (
        <>
          {overview && (
            <div className="stats-grid">
              <Stat
                icon={BookOpen}
                label="Your courses"
                value={courses.length}
                detail="Built around what you know"
              />
              <Stat
                icon={Users}
                label="Course enrollments"
                value={courses.reduce((n, c) => n + c.studentCount, 0)}
                detail="Learners taking the next step"
              />
              <Stat
                icon={Layers3}
                label="Published lessons"
                value={courses.reduce((n, c) => n + c.lessonCount, 0)}
                detail="Small steps, thoughtfully made"
              />
            </div>
          )}
          <div className="section-heading compact">
            <h2>
              {overview ? "Your teaching workspace" : "Course collection"}
            </h2>
            <span>
              {courses.length} {courses.length === 1 ? "course" : "courses"}
            </span>
          </div>
          <div className="mb-4">
            <SearchInput
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search your courses"
            />
          </div>
          {visible.length ? (
            <div className="management-list">
              {visible.map((course) => (
                <article className="managed-course" key={course._id}>
                  <div className="managed-cover">
                    <CourseCover
                      title={course.title}
                      cover={course.cover}
                      small
                    />
                  </div>
                  <div className="managed-course-copy">
                    <span className="eyebrow">
                      {course.category} · {course.level}
                    </span>
                    <h3>
                      <Link to={`/courses/${course._id}`}>{course.title}</Link>
                    </h3>
                    <p>
                      {course.lessonCount} lessons <span>·</span>{" "}
                      {course.studentCount} enrollments{" "}
                      {user.role === "admin" && (
                        <span>· {course.instructor?.name}</span>
                      )}
                    </p>
                  </div>
                  <div className="managed-actions">
                    <Link
                      className="btn btn-light"
                      to={`${base}/courses/${course._id}/lessons`}
                    >
                      <Layers3 size={16} />
                      Lessons
                    </Link>
                    <Link
                      className="icon-button bordered"
                      to={`${base}/courses/${course._id}/edit`}
                      aria-label={`Edit ${course.title}`}
                    >
                      <Pencil size={17} />
                    </Link>
                    <button
                      className="icon-button bordered danger"
                      onClick={() => setRemove(course)}
                      aria-label={`Delete ${course.title}`}
                    >
                      <Trash2 size={17} />
                    </button>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <EmptyState
              title={
                courses.length
                  ? "No matching courses"
                  : "Your first course starts with an idea."
              }
              description={
                courses.length
                  ? "Try another course name in the search box."
                  : "Create a course, add a few thoughtful lessons, and give learners a place to begin."
              }
              action={
                <Link to={`${base}/courses/new`} className="btn btn-primary">
                  Create a course
                </Link>
              }
            />
          )}
        </>
      )}
      <ConfirmDialog
        show={Boolean(remove)}
        title="Delete this course?"
        busy={busy}
        onCancel={() => setRemove(null)}
        onConfirm={deleteCourse}
      >
        <p>
          <strong>{remove?.title}</strong>
        </p>
        <p>
          This also removes its lessons, uploaded resources, enrollments, and
          learner progress. This action cannot be undone.
        </p>
      </ConfirmDialog>
    </>
  );
}
