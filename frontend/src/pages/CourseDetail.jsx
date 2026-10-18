import VideoPlayer from "../components/VideoPlayer";
import { useEffect, useState } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import {
  CheckCircle2,
  Clock3,
  Layers3,
  LockKeyhole,
  BookOpen,
  Check,
  GraduationCap,
} from "lucide-react";
import api, { errorMessage } from "../services/api";
import { useAuth } from "../context/AuthContext";
import {
  Avatar,
  CourseCover,
  ErrorBox,
  Loading,
  priceLabel,
} from "../components/Shared";
export default function CourseDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [enrolled, setEnrolled] = useState(false);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  useEffect(() => {
    let active = true;
    setData(null);
    setError("");
    Promise.all([
      api.get(`/courses/${id}`),
      user?.role === "student" ? api.get("/my-courses") : Promise.resolve(null),
    ])
      .then(([course, mine]) => {
        if (active) {
          setData(course.data);
          setEnrolled(
            mine?.data.enrollments.some((e) => e.course._id === id) || false,
          );
        }
      })
      .catch((e) => active && setError(errorMessage(e)));
    return () => {
      active = false;
    };
  }, [id, user?._id]);
  async function enroll() {
    if (!user) return navigate("/login", { state: { from: `/courses/${id}` } });
    setBusy(true);
    setError("");
    try {
      await api.post("/enroll", { courseId: id });
      navigate(`/learn/${id}`);
    } catch (e) {
      if (e.response?.status === 409) {
        setEnrolled(true);
      } else setError(errorMessage(e));
    } finally {
      setBusy(false);
    }
  }
  if (!data)
    return (
      <div className="container py-5">
        {error ? <ErrorBox message={error} /> : <Loading />}
      </div>
    );
  const { course, lessons } = data;
  const canPreview =
    user?.role === "admin" ||
    String(user?._id) === String(course.instructor?._id);
  return (
    <div className="detail-page">
      <div className="detail-header">
        <div className="container">
          <div className="breadcrumb-line">
            <Link to="/courses">Explore courses</Link>
            <span>/</span>
            {course.category}
          </div>
          <div className="row">
            <div className="col-lg-8">
              <span className="category-pill">{course.category}</span>
              <h1>{course.title}</h1>
              <p>{course.description}</p>
              <div className="detail-instructor">
                <Avatar name={course.instructor?.name} large />
                <div>
                  <span>COURSE CURATOR</span>
                  <strong>{course.instructor?.name}</strong>
                </div>
              </div>
              <div className="detail-meta">
                <span>
                  <GraduationCap size={18} />
                  {course.level}
                </span>
                <span>
                  <Clock3 size={18} />
                  {course.duration}
                </span>
                <span>
                  <Layers3 size={18} />
                  {lessons.length} lessons
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="container detail-content">
        <div className="row gy-4">
          <div className="col-lg-8 pe-lg-5">
            {course.previewVideoUrl && (
              <section className="content-panel">
                <h2>Take a look inside</h2>
                <VideoPlayer
                  url={course.previewVideoUrl}
                  title={`${course.title} — first lesson`}
                  creator={course.sourceAuthor}
                />
              </section>
            )}
            {course.sourceAuthor && (
              <div className="source-credit">
                <strong>Original videos by {course.sourceAuthor}</strong>
                <p>
                  Watch the creator’s lessons in playlist order. LearnHub
                  organizes your learning and saves your progress.
                </p>
                {course.playlistUrl && (
                  <a href={course.playlistUrl} target="_blank" rel="noreferrer">
                    View original YouTube playlist ↗
                  </a>
                )}
              </div>
            )}
            <section className="content-panel">
              <span className="eyebrow">A CLEAR PATH FORWARD</span>
              <h2>What you’ll take away</h2>
              <div className="outcome-grid">
                {(course.outcomes.length
                  ? course.outcomes
                  : [
                      "Understand the core concepts",
                      "Apply your learning in a practical example",
                    ]
                ).map((item) => (
                  <div key={item}>
                    <CheckCircle2 size={21} />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </section>
            <section className="content-panel">
              <div className="section-heading compact">
                <h2>Your learning journey</h2>
                <span>{lessons.length} lessons</span>
              </div>
              <div className="curriculum">
                {lessons.map((lesson, index) => (
                  <div className="curriculum-item" key={lesson._id}>
                    <span className="lesson-number">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    <strong>{lesson.title}</strong>
                    <LockKeyhole size={17} />
                  </div>
                ))}
                {lessons.length === 0 && (
                  <p className="text-secondary">
                    Your instructor is preparing the lessons for this course.
                  </p>
                )}
              </div>
            </section>
          </div>
          <div className="col-lg-4">
            <aside className="enrollment-card">
              <CourseCover title={course.title} cover={course.cover} />
              <div className="enrollment-body">
                <div className="enrollment-price">
                  <strong>{priceLabel(course.price)}</strong>
                  <span>Learn at your own pace</span>
                </div>
                <ErrorBox message={error} />
                {enrolled || canPreview ? (
                  <Link to={`/learn/${id}`} className="btn btn-primary w-100">
                    {canPreview ? "Preview lessons" : "Continue learning"}
                  </Link>
                ) : user && user.role !== "student" ? (
                  <p className="form-text">
                    Sign in with a Student account to enroll in courses.
                  </p>
                ) : (
                  <button
                    className="btn btn-primary w-100"
                    onClick={enroll}
                    disabled={busy}
                  >
                    {busy ? "Enrolling…" : "Enroll in this course"}
                  </button>
                )}
                <div className="enrollment-includes">
                  <span>
                    <BookOpen size={18} />
                    Step-by-step lessons
                  </span>
                  <span>
                    <Check size={18} />
                    Saved learning progress
                  </span>
                  <span>
                    <Layers3 size={18} />
                    Lesson resources when provided
                  </span>
                </div>
              </div>
            </aside>
          </div>
        </div>
      </div>
    </div>
  );
}
