import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { BookOpen, Trophy, ChartNoAxesCombined, Play } from "lucide-react";
import api, { errorMessage } from "../services/api";
import { useAuth } from "../context/AuthContext";
import {
  CourseCard,
  PageIntro,
  ErrorBox,
  Loading,
  EmptyState,
} from "../components/Shared";
export default function StudentDashboard({ coursesOnly = false }) {
  const { user } = useAuth();
  const [enrollments, setEnrollments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState("All courses");
  function load() {
    setLoading(true);
    api
      .get("/my-courses")
      .then(({ data }) => {
        setEnrollments(data.enrollments);
        setError("");
      })
      .catch((e) => setError(errorMessage(e)))
      .finally(() => setLoading(false));
  }
  useEffect(load, []);
  const completed = enrollments.filter((e) => e.progress === 100).length;
  const average = enrollments.length
    ? Math.round(
        enrollments.reduce((a, e) => a + e.progress, 0) / enrollments.length,
      )
    : 0;
  const visible = enrollments.filter(
    (e) =>
      filter === "All courses" ||
      (filter === "Completed" ? e.progress === 100 : e.progress < 100),
  );
  const next = enrollments.find((e) => e.progress < 100);
  return (
    <>
      <PageIntro
        eyebrow={
          coursesOnly
            ? "YOUR PERSONAL COLLECTION"
            : "A LITTLE PROGRESS, EVERY DAY"
        }
        title={
          coursesOnly
            ? "My learning"
            : `Welcome back, ${user.name.split(" ")[0]}.`
        }
        description={
          coursesOnly
            ? "Everything you’re learning, all in one place."
            : "Your next chapter is already underway."
        }
      >
        <Link className="btn btn-outline-primary" to="/courses">
          Explore courses
        </Link>
      </PageIntro>
      <ErrorBox message={error} retry={load} />
      {loading ? (
        <Loading />
      ) : (
        <>
          {!coursesOnly && (
            <>
              <div className="stats-grid">
                <Stat
                  icon={BookOpen}
                  label="Enrolled courses"
                  value={enrollments.length}
                  detail="Your learning collection"
                />
                <Stat
                  icon={Trophy}
                  label="Completed courses"
                  value={completed}
                  detail="Skills worth celebrating"
                />
                <Stat
                  icon={ChartNoAxesCombined}
                  label="Average progress"
                  value={`${average}%`}
                  detail="Every lesson counts"
                />
              </div>
              {next && (
                <div className="continue-banner">
                  <div className="continue-symbol">
                    <Play size={26} fill="currentColor" />
                  </div>
                  <div>
                    <span className="eyebrow">PICK UP WHERE YOU LEFT OFF</span>
                    <h2>{next.course.title}</h2>
                    <p>
                      {next.progress}% complete · One more lesson is a good
                      start.
                    </p>
                  </div>
                  <Link
                    to={`/learn/${next.course._id}`}
                    className="btn btn-white"
                  >
                    Continue learning
                  </Link>
                </div>
              )}
            </>
          )}
          <div className="section-heading compact">
            <h2>{coursesOnly ? "Your courses" : "Keep the momentum"}</h2>
            <div className="filter-tabs compact-tabs">
              {["All courses", "In progress", "Completed"].map((item) => (
                <button
                  key={item}
                  onClick={() => setFilter(item)}
                  className={filter === item ? "active" : ""}
                  aria-pressed={filter === item}
                >
                  {item}
                </button>
              ))}
            </div>
          </div>
          {visible.length ? (
            <div className="row g-4">
              {visible.map((e) => (
                <div className="col-md-6 col-xxl-4" key={e._id}>
                  <CourseCard course={e.course} enrollment={e} />
                </div>
              ))}
            </div>
          ) : (
            <EmptyState
              title={
                enrollments.length
                  ? "Your next milestone is ahead."
                  : "Your learning journey starts here."
              }
              description={
                enrollments.length
                  ? "Courses matching this filter will appear here."
                  : "Find something you’re curious about and enroll in your first course."
              }
              action={
                <Link to="/courses" className="btn btn-primary">
                  Explore courses
                </Link>
              }
            />
          )}
        </>
      )}
    </>
  );
}
export function Stat({ icon: Icon, label, value, detail }) {
  return (
    <div className="stat-card">
      <div className="stat-top">
        <span>{label}</span>
        <span className="stat-icon">
          <Icon size={19} />
        </span>
      </div>
      <strong>{value}</strong>
      <p>{detail}</p>
    </div>
  );
}
