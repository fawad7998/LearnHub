import { useEffect, useState } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { courseIcons, categories } from "../config/courseOptions";
import { Save, BookOpen } from "lucide-react";
import api, { errorMessage } from "../services/api";
import { useAuth, dashboardFor } from "../context/AuthContext";
import {
  PageIntro,
  ErrorBox,
  Loading,
  CourseCover,
} from "../components/Shared";
const initial = {
  title: "",
  description: "",
  category: "Development",
  price: 0,
  level: "Beginner",
  duration: "Self-paced",
  cover: "react",
  outcomes: "",
  playlistUrl: "",
  previewVideoUrl: "",
  sourceAuthor: "",
};
export default function CourseEditor() {
  const { id } = useParams();
  const { user } = useAuth();
  const base = dashboardFor(user);
  const navigate = useNavigate();
  const [form, setForm] = useState(initial);
  const [loading, setLoading] = useState(Boolean(id));
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  useEffect(() => {
    if (id)
      api
        .get(`/courses/${id}`)
        .then(({ data: { course } }) =>
          setForm({
            title: course.title,
            description: course.description,
            category: course.category,
            price: course.price,
            level: course.level,
            duration: course.duration,
            cover: course.cover,
            outcomes: course.outcomes.join("\n"),
            playlistUrl: course.playlistUrl || "",
            previewVideoUrl: course.previewVideoUrl || "",
            sourceAuthor: course.sourceAuthor || "",
          }),
        )
        .catch((e) => setError(errorMessage(e)))
        .finally(() => setLoading(false));
  }, [id]);
  function update(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }
  async function save(e) {
    e.preventDefault();
    setBusy(true);
    setError("");
    const payload = {
      ...form,
      price: Number(form.price),
      outcomes: form.outcomes
        .split("\n")
        .map((s) => s.trim())
        .filter(Boolean),
    };
    try {
      const { data } = id
        ? await api.put(`/courses/${id}`, payload)
        : await api.post("/courses", payload);
      navigate(`${base}/courses/${data.course._id}/lessons`, {
        state: { saved: true },
      });
    } catch (e) {
      setError(errorMessage(e));
    } finally {
      setBusy(false);
    }
  }
  return (
    <>
      <Link className="back-link" to={`${base}/courses`}>
        Back to courses
      </Link>
      <PageIntro
        eyebrow="MAKE SOMETHING WORTH LEARNING"
        title={id ? "Refine your course" : "Create a new course"}
        description="Start with a clear idea. Give learners a reason to be curious."
      />
      <ErrorBox message={error} />
      {loading ? (
        <Loading />
      ) : (
        <form onSubmit={save}>
          <div className="row g-4">
            <div className="col-xl-8">
              <div className="editor-panel">
                <h2>The essentials</h2>
                <div className="mb-4">
                  <label className="form-label" htmlFor="title">
                    Course title
                  </label>
                  <input
                    id="title"
                    name="title"
                    className="form-control"
                    placeholder="A clear, useful name for your course"
                    value={form.title}
                    onChange={update}
                    required
                    minLength={3}
                    maxLength={100}
                  />
                </div>
                <div className="mb-4">
                  <label className="form-label" htmlFor="description">
                    Description
                  </label>
                  <textarea
                    id="description"
                    name="description"
                    className="form-control"
                    rows={5}
                    placeholder="What will learners explore, and why does it matter?"
                    value={form.description}
                    onChange={update}
                    required
                    minLength={20}
                    maxLength={5000}
                  />
                </div>
                <div className="row g-3 mb-4">
                  <div className="col-sm-6">
                    <label htmlFor="category" className="form-label">
                      Category
                    </label>
                    <select
                      id="category"
                      name="category"
                      className="form-select"
                      value={form.category}
                      onChange={update}
                    >
                      {categories.map((s) => (
                        <option key={s}>{s}</option>
                      ))}
                    </select>
                  </div>
                  <div className="col-sm-6">
                    <label htmlFor="level" className="form-label">
                      Level
                    </label>
                    <select
                      id="level"
                      name="level"
                      className="form-select"
                      value={form.level}
                      onChange={update}
                    >
                      {["Beginner", "Intermediate", "Advanced"].map((s) => (
                        <option key={s}>{s}</option>
                      ))}
                    </select>
                  </div>
                  <div className="col-sm-6">
                    <label htmlFor="duration" className="form-label">
                      Estimated duration
                    </label>
                    <input
                      id="duration"
                      name="duration"
                      className="form-control"
                      value={form.duration}
                      onChange={update}
                      required
                      maxLength={40}
                    />
                  </div>
                  <div className="col-sm-6">
                    <label htmlFor="price" className="form-label">
                      Listed price in PKR
                    </label>
                    <input
                      type="number"
                      min="0"
                      max="1000000"
                      step="0.01"
                      id="price"
                      name="price"
                      className="form-control"
                      value={form.price}
                      onChange={update}
                      required
                    />
                    <div className="form-text">
                      Use 0 for free courses. Payment collection is not enabled.
                    </div>
                  </div>
                </div>
                <div className="mb-4">
                  <h2>Video & source</h2>
                  <label htmlFor="previewVideoUrl" className="form-label">
                    Introductory YouTube video{" "}
                    <span className="text-secondary">(optional)</span>
                  </label>
                  <input
                    id="previewVideoUrl"
                    type="url"
                    name="previewVideoUrl"
                    className="form-control mb-3"
                    value={form.previewVideoUrl}
                    onChange={update}
                    placeholder="https://www.youtube.com/watch?v=…"
                    maxLength={500}
                  />
                  <label htmlFor="playlistUrl" className="form-label">
                    YouTube playlist{" "}
                    <span className="text-secondary">(optional)</span>
                  </label>
                  <input
                    id="playlistUrl"
                    type="url"
                    name="playlistUrl"
                    className="form-control mb-3"
                    value={form.playlistUrl}
                    onChange={update}
                    placeholder="https://www.youtube.com/playlist?list=…"
                    maxLength={500}
                  />
                  <label htmlFor="sourceAuthor" className="form-label">
                    Original video creator{" "}
                    <span className="text-secondary">(optional)</span>
                  </label>
                  <input
                    id="sourceAuthor"
                    name="sourceAuthor"
                    className="form-control"
                    value={form.sourceAuthor}
                    onChange={update}
                    placeholder="Your name or the original YouTube channel"
                    maxLength={120}
                  />
                  <p className="form-text">
                    The introduction appears on the course page. Add individual
                    lessons after saving. Credit the original creator when you
                    curate another teacher’s videos.
                  </p>
                </div>
                <label htmlFor="outcomes" className="form-label">
                  What will learners take away?
                </label>
                <textarea
                  id="outcomes"
                  name="outcomes"
                  className="form-control"
                  rows={4}
                  placeholder={
                    "Build a complete page\nUnderstand the core concepts\nApply the ideas to your own project"
                  }
                  value={form.outcomes}
                  onChange={update}
                />
                <div className="form-text">
                  One learning outcome per line. Up to 8 outcomes.
                </div>
              </div>
            </div>
            <div className="col-xl-4">
              <div className="editor-panel">
                <h2>A first impression</h2>
                <CourseCover
                  cover={form.cover}
                  title={form.title || "Your course title"}
                />
                <fieldset className="icon-picker">
                  <legend>Choose a course icon</legend>
                  <div>
                    {courseIcons.map(({ value, label, icon: Icon }) => (
                      <label
                        key={value}
                        className={form.cover === value ? "selected" : ""}
                      >
                        <input
                          type="radio"
                          name="cover"
                          value={value}
                          checked={form.cover === value}
                          onChange={update}
                        />
                        <Icon size={24} />
                        <span>{label}</span>
                      </label>
                    ))}
                  </div>
                </fieldset>
                <div className="editor-tip">
                  <BookOpen size={20} />
                  <p>
                    Keep the title specific and the description welcoming. You
                    can add lessons after saving.
                  </p>
                </div>
              </div>
            </div>
          </div>
          <div className="editor-actions">
            <Link to={`${base}/courses`} className="btn btn-light">
              Cancel
            </Link>
            <button className="btn btn-primary" disabled={busy}>
              <Save size={17} />
              {busy ? "Saving…" : "Save and manage lessons"}
            </button>
          </div>
        </form>
      )}
    </>
  );
}
