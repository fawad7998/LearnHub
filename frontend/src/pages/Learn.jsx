import { useEffect, useState } from "react";
import VideoPlayer from "../components/VideoPlayer";
import ThemeToggle from "../components/ThemeToggle";
import { Link, useParams } from "react-router-dom";
import { CheckCircle2, Download, BookOpen, Menu } from "lucide-react";
import api, { errorMessage, downloadResource } from "../services/api";
import { useAuth, dashboardFor } from "../context/AuthContext";
import {
  Brand,
  Loading,
  ErrorBox,
  EmptyState,
  SuccessMessage,
} from "../components/Shared";
import { Offcanvas } from "react-bootstrap";
export default function Learn() {
  const { id } = useParams();
  const { user } = useAuth();
  const [course, setCourse] = useState(null);
  const [lessons, setLessons] = useState([]);
  const [enrollment, setEnrollment] = useState(null);
  const [selected, setSelected] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [menu, setMenu] = useState(false);
  const [downloading, setDownloading] = useState(false);
  useEffect(() => {
    let active = true;
    setLoading(true);
    setError("");
    Promise.all([
      api.get(`/courses/${id}`),
      api.get(`/courses/${id}/lessons`),
      user.role === "student" ? api.get("/my-courses") : Promise.resolve(null),
    ])
      .then(([a, b, c]) => {
        if (!active) return;
        setCourse(a.data.course);
        setLessons(b.data.lessons);
        const e = c?.data.enrollments.find((e) => e.course._id === id);
        setEnrollment(e || null);
        const next = b.data.lessons.findIndex(
          (l) => !e?.completedLessons.includes(l._id),
        );
        setSelected(Math.max(next, 0));
      })
      .catch((e) => active && setError(errorMessage(e)))
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, [id, user._id]);
  const current = lessons[selected];
  const complete = enrollment?.completedLessons.includes(current?._id);
  async function markComplete() {
    setBusy(true);
    setError("");
    try {
      const { data } = await api.patch(`/lessons/${current._id}/complete`);
      setEnrollment(data.enrollment);
    } catch (e) {
      setError(errorMessage(e));
    } finally {
      setBusy(false);
    }
  }
  async function download() {
    setDownloading(true);
    try {
      await downloadResource(current._id, current.resource.name);
    } catch (e) {
      setError(errorMessage(e));
    } finally {
      setDownloading(false);
    }
  }
  const lessonList = (
    <>
      <span className="eyebrow">YOUR LEARNING JOURNEY</span>
      <h2>{course?.title}</h2>
      {enrollment && (
        <div className="learning-progress">
          <div>
            <span>Your progress</span>
            <strong>{enrollment.progress}%</strong>
          </div>
          <div className="progress">
            <div
              className="progress-bar"
              style={{
                width: `${enrollment.progress}%`,
              }}
            />
          </div>
        </div>
      )}
      <nav className="lesson-nav" aria-label="Course lessons">
        {lessons.map((lesson, index) => (
          <button
            key={lesson._id}
            className={selected === index ? "active" : ""}
            onClick={() => {
              setSelected(index);
              setMenu(false);
              window.scrollTo({
                top: 0,
              });
            }}
          >
            <span>
              {enrollment?.completedLessons.includes(lesson._id) ? (
                <CheckCircle2 size={20} />
              ) : (
                <span className="lesson-index">
                  {String(index + 1).padStart(2, "0")}
                </span>
              )}
            </span>
            <span>{lesson.title}</span>
          </button>
        ))}
      </nav>
      <div className="lesson-sidebar-note">
        <BookOpen size={23} />
        <p>
          Take your time.
          <br />
          Understanding is the goal.
        </p>
      </div>
    </>
  );
  return (
    <div className="learning-shell">
      <a className="skip-link" href="#main">
        Skip to lesson
      </a>
      <header className="learning-header">
        <Brand />
        <div className="topbar-actions">
          <ThemeToggle />
          <Link to={dashboardFor(user)} className="back-link">
            Back to dashboard
          </Link>
        </div>
      </header>
      {loading ? (
        <Loading />
      ) : (
        <>
          <div className="learning-layout">
            <aside className="learning-sidebar">{lessonList}</aside>
            <main id="main" className="lesson-main">
              <button
                className="btn btn-light mobile-lesson-menu"
                onClick={() => setMenu(true)}
              >
                <Menu size={18} />
                Course lessons
              </button>
              <ErrorBox message={error} />
              {current ? (
                <>
                  <div className="lesson-kicker">
                    <span className="eyebrow">
                      LESSON {String(selected + 1).padStart(2, "0")} OF{" "}
                      {String(lessons.length).padStart(2, "0")}
                    </span>
                    {complete && (
                      <span className="status-badge active-status">
                        <CheckCircle2 size={14} />
                        Completed
                      </span>
                    )}
                  </div>
                  <h1>{current.title}</h1>
                  {current.videoUrl && (
                    <VideoPlayer
                      key={current._id}
                      url={current.videoUrl}
                      title={current.title}
                      creator={current.sourceAuthor || course.sourceAuthor}
                    />
                  )}
                  {current.content && (
                    <div className="lesson-reading">
                      <span className="reading-label">
                        MAKE ROOM FOR A NEW IDEA
                      </span>
                      {current.content
                        .split("\n\n")
                        .filter(Boolean)
                        .map((paragraph, index) => (
                          <p key={index}>{paragraph}</p>
                        ))}
                    </div>
                  )}
                  {current.resource && (
                    <div className="lesson-resource">
                      <BookOpen size={24} />
                      <div>
                        <strong>Keep learning offline</strong>
                        <span>
                          {current.resource.name} ·{" "}
                          {(current.resource.size / 1024).toFixed(0)} KB
                        </span>
                      </div>
                      <button
                        className="btn btn-outline-primary"
                        onClick={download}
                        disabled={downloading}
                      >
                        <Download size={17} />
                        {downloading ? "Downloading…" : "Download PDF"}
                      </button>
                    </div>
                  )}
                  {enrollment?.progress === 100 && (
                    <SuccessMessage>
                      <span>
                        <strong>A chapter completed.</strong> You’ve finished
                        every lesson in this course.
                      </span>
                    </SuccessMessage>
                  )}
                  <div className="lesson-completion">
                    {enrollment ? (
                      <>
                        <div>
                          <strong>
                            {complete
                              ? "One more step forward."
                              : "Ready to make it count?"}
                          </strong>
                          <p>
                            {complete
                              ? "Review this lesson anytime, or continue your journey."
                              : "Mark this lesson complete when the idea feels clear."}
                          </p>
                        </div>
                        <button
                          className={`btn ${complete ? "btn-light" : "btn-primary"}`}
                          disabled={busy || complete}
                          onClick={markComplete}
                        >
                          <CheckCircle2 size={18} />
                          {busy
                            ? "Saving…"
                            : complete
                              ? "Lesson completed"
                              : "Mark as complete"}
                        </button>
                      </>
                    ) : (
                      <p>
                        You are previewing this course as{" "}
                        {user.role === "admin" ? "an admin" : "its instructor"}.
                      </p>
                    )}
                  </div>
                  <div className="lesson-pagination">
                    <button
                      className="btn btn-light"
                      disabled={selected === 0}
                      onClick={() => {
                        setSelected(selected - 1);
                        window.scrollTo({
                          top: 0,
                        });
                      }}
                    >
                      Previous lesson
                    </button>
                    <button
                      className="btn btn-outline-primary"
                      disabled={selected === lessons.length - 1}
                      onClick={() => {
                        setSelected(selected + 1);
                        window.scrollTo({
                          top: 0,
                        });
                      }}
                    >
                      Next lesson
                    </button>
                  </div>
                </>
              ) : (
                !error && (
                  <EmptyState
                    title="Your next lesson is on its way."
                    description="The instructor is preparing this course. Check back soon."
                    action={
                      <Link to="/courses" className="btn btn-primary">
                        Explore other courses
                      </Link>
                    }
                  />
                )
              )}
            </main>
          </div>
          <Offcanvas show={menu} onHide={() => setMenu(false)}>
            <Offcanvas.Header closeButton>
              <Offcanvas.Title>Course lessons</Offcanvas.Title>
            </Offcanvas.Header>
            <Offcanvas.Body>{lessonList}</Offcanvas.Body>
          </Offcanvas>
        </>
      )}
    </div>
  );
}
