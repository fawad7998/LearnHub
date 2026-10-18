import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  Users,
  BookOpen,
  GraduationCap,
  LibraryBig,
  Plus,
  ShieldCheck,
  ArrowRight,
} from "lucide-react";
import api, { errorMessage } from "../services/api";
import {
  PageIntro,
  ErrorBox,
  Loading,
  Avatar,
  EmptyState,
} from "../components/Shared";
import { Stat } from "./StudentDashboard";
export default function AdminDashboard() {
  const [data, setData] = useState(null);
  const [error, setError] = useState("");
  function load() {
    setError("");
    api
      .get("/admin/analytics")
      .then(({ data }) => setData(data))
      .catch((e) => setError(errorMessage(e)));
  }
  useEffect(() => {
    load();
    const refresh = () => {
      if (!document.hidden) load();
    };
    const timer = setInterval(refresh, 30000);
    window.addEventListener("focus", refresh);
    return () => {
      clearInterval(timer);
      window.removeEventListener("focus", refresh);
    };
  }, []);
  return (
    <>
      <PageIntro
        eyebrow="THE BIGGER PICTURE"
        title="A place to grow."
        description="Your learning community, at a glance."
      >
        <Link to="/dashboard/admin/courses/new" className="btn btn-primary">
          <Plus size={17} />
          Create course
        </Link>
      </PageIntro>
      <ErrorBox message={error} retry={load} />
      {!data ? (
        !error && <Loading />
      ) : (
        <>
          <div className="approval-banner">
            <span className="approval-banner-icon">
              <ShieldCheck size={27} />
            </span>
            <div>
              <h2>
                {data.stats.pendingTeachers || 0} teacher application
                {data.stats.pendingTeachers === 1 ? "" : "s"} awaiting review
              </h2>
              <p>
                Approve new teachers before they can sign in and publish
                courses.
              </p>
            </div>
            <Link to="/dashboard/admin/teachers" className="btn btn-primary">
              Review applications <ArrowRight size={17} />
            </Link>
          </div>
          <div className="stats-grid four-stats">
            <Stat
              icon={Users}
              label="Students"
              value={data.stats.students}
              detail="Curious minds, new possibilities"
            />
            <Stat
              icon={GraduationCap}
              label="Teachers"
              value={data.stats.instructors}
              detail="People sharing what they know"
            />
            <Stat
              icon={BookOpen}
              label="Courses"
              value={data.stats.courses}
              detail="Paths to something new"
            />
            <Stat
              icon={LibraryBig}
              label="Enrollments"
              value={data.stats.enrollments}
              detail={`${data.stats.completed} courses completed`}
            />
          </div>
          <div className="row g-4">
            <div className="col-xl-7">
              <section className="editor-panel h-100">
                <div className="section-heading compact">
                  <div>
                    <span className="eyebrow">WHERE CURIOSITY GOES</span>
                    <h2>Course enrollments</h2>
                  </div>
                  <span className="subtle-badge">All time</span>
                </div>
                {data.popular.length ? (
                  <div className="analytics-bars">
                    {data.popular.map((course) => (
                      <div className="analytics-row" key={course._id}>
                        <div>
                          <span>{course.title}</span>
                          <strong>{course.count}</strong>
                        </div>
                        <div className="analytics-track">
                          <div
                            style={{
                              width: `${(course.count / Math.max(...data.popular.map((c) => c.count), 1)) * 100}%`,
                            }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <EmptyState
                    title="Your community is just beginning."
                    description="Enrollment totals will appear as students join courses."
                  />
                )}
                <Link to="/dashboard/admin/courses" className="text-link">
                  Manage all courses
                </Link>
              </section>
            </div>
            <div className="col-xl-5">
              <section className="editor-panel h-100">
                <div className="section-heading compact">
                  <div>
                    <span className="eyebrow">NEW BEGINNINGS</span>
                    <h2>Recent enrollments</h2>
                  </div>
                </div>
                {data.recent.length ? (
                  data.recent.map((e) => (
                    <div className="recent-enrollment" key={e._id}>
                      <Avatar name={e.student.name} />
                      <div>
                        <strong>{e.student.name}</strong>
                        <p>{e.course.title}</p>
                        <span>
                          {new Date(e.createdAt).toLocaleDateString(undefined, {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })}
                        </span>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-secondary">
                    New enrollments will appear here.
                  </p>
                )}
              </section>
            </div>
          </div>
          <div className="admin-note">
            <div>
              <h2>Good learning starts with good people.</h2>
              <p>Manage your students, teachers, and account permissions.</p>
            </div>
            <Link
              to="/dashboard/admin/users"
              className="btn btn-outline-primary"
            >
              Manage users
            </Link>
          </div>
        </>
      )}
    </>
  );
}
