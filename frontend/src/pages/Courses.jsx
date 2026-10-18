import { useEffect, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import api, { errorMessage } from "../services/api";
import {
  CourseCard,
  CourseSkeleton,
  ErrorBox,
  EmptyState,
  SearchInput,
} from "../components/Shared";
import { categories as courseCategories } from "../config/courseOptions";
const categories = ["All courses", ...courseCategories];
export default function Courses() {
  const [params, setParams] = useSearchParams();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [query, setQuery] = useState(params.get("q") || "");
  const category = params.get("category") || "All courses";
  useEffect(() => {
    let active = true;
    setLoading(true);
    setError("");
    const timer = setTimeout(
      () =>
        api
          .get("/courses", {
            params: {
              category: category === "All courses" ? undefined : category,
              q: query,
            },
          })
          .then(({ data }) => {
            if (active) setCourses(data.courses);
          })
          .catch((e) => {
            if (active) setError(errorMessage(e));
          })
          .finally(() => {
            if (active) setLoading(false);
          }),
      200,
    );
    return () => {
      active = false;
      clearTimeout(timer);
    };
  }, [category, query]);
  return (
    <>
      <section className="catalog-heading">
        <div className="container">
          <div className="breadcrumb-line">
            <Link to="/">Home</Link>
            <span>/</span>Explore courses
          </div>
          <span className="eyebrow">FOLLOW YOUR CURIOSITY</span>
          <h1>
            Your next skill
            <br />
            starts <span>right here.</span>
          </h1>
          <p>Practical courses. Clear lessons. Progress at your pace.</p>
        </div>
      </section>
      <section className="container catalog-section">
        <div className="catalog-tools">
          <div className="filter-tabs" aria-label="Course categories">
            {categories.map((item) => (
              <button
                key={item}
                className={category === item ? "active" : ""}
                aria-pressed={category === item}
                onClick={() =>
                  setParams(item === "All courses" ? {} : { category: item })
                }
              >
                {item}
              </button>
            ))}
          </div>
          <SearchInput
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
        <div className="results-caption">
          <span>
            {loading
              ? "Finding your next skill…"
              : `${courses.length} ${courses.length === 1 ? "course" : "courses"} to explore`}
          </span>
          <span>Learn something that stays with you.</span>
        </div>
        <ErrorBox message={error} />
        {loading ? (
          <CourseSkeleton />
        ) : courses.length ? (
          <div className="row g-4">
            {courses.map((course) => (
              <div className="col-md-6 col-xl-4" key={course._id}>
                <CourseCard course={course} />
              </div>
            ))}
          </div>
        ) : (
          !error && (
            <EmptyState
              title="A different search might help."
              description="Try another course name or explore all categories."
              action={
                <button
                  className="btn btn-primary"
                  onClick={() => {
                    setQuery("");
                    setParams({});
                  }}
                >
                  Show all courses
                </button>
              }
            />
          )
        )}
      </section>
    </>
  );
}
