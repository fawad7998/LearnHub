import { useEffect, useState } from "react";
import { Link, useParams, useLocation } from "react-router-dom";
import {
  Pencil,
  Trash2,
  FileText,
  Save,
  ListVideo,
  Video,
  Plus,
} from "lucide-react";
import api, { errorMessage } from "../services/api";
import { useAuth, dashboardFor } from "../context/AuthContext";
import {
  PageIntro,
  ErrorBox,
  Loading,
  SuccessMessage,
  ConfirmDialog,
  EmptyState,
  SearchInput,
} from "../components/Shared";

const blank = { title: "", videoUrl: "", content: "", order: 1 };
export default function LessonEditor() {
  const { id } = useParams();
  const { user } = useAuth();
  const location = useLocation();
  const base = dashboardFor(user);
  const [course, setCourse] = useState(null);
  const [lessons, setLessons] = useState([]);
  const [form, setForm] = useState(blank);
  const [editing, setEditing] = useState(null);
  const [file, setFile] = useState(null);
  const [fileKey, setFileKey] = useState(0);
  const [busy, setBusy] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");
  const [playlistUrl, setPlaylistUrl] = useState("");
  const [message, setMessage] = useState(
    location.state?.saved
      ? "Course saved. Add your first video lesson below."
      : "",
  );
  const [remove, setRemove] = useState(null);
  const nextOrder = (items) =>
    Math.max(0, ...items.map((lesson) => lesson.order)) + 1;

  async function load() {
    const [a, b] = await Promise.all([
      api.get(`/courses/${id}`),
      api.get(`/courses/${id}/lessons`),
    ]);
    setCourse(a.data.course);
    setPlaylistUrl(a.data.course.playlistUrl || "");
    setLessons(b.data.lessons);
    return b.data.lessons;
  }
  useEffect(() => {
    setLoading(true);
    load()
      .then((items) => setForm({ ...blank, order: nextOrder(items) }))
      .catch((e) => setError(errorMessage(e)))
      .finally(() => setLoading(false));
  }, [id]);
  function reset(items = lessons) {
    setForm({ ...blank, order: nextOrder(items) });
    setEditing(null);
    setFile(null);
    setFileKey((key) => key + 1);
  }
  function edit(lesson) {
    setEditing(lesson._id);
    setForm({
      title: lesson.title,
      videoUrl: lesson.videoUrl || "",
      content: lesson.content || "",
      order: lesson.order,
    });
    setFile(null);
    setFileKey((key) => key + 1);
    document
      .getElementById("lesson-form")
      ?.scrollIntoView({ behavior: "smooth", block: "start" });
  }
  async function save(event) {
    event.preventDefault();
    setError("");
    setMessage("");
    if (!form.videoUrl && form.content.trim().length < 20)
      return setError(
        "Add a YouTube video link, or write at least 20 characters in the optional lesson notes.",
      );
    if (file && file.size > 2 * 1024 * 1024)
      return setError("Choose a PDF smaller than 2 MB.");
    setBusy(true);
    const payload = new FormData();
    Object.entries(form).forEach(([key, value]) => payload.append(key, value));
    if (file) payload.append("resource", file);
    try {
      if (editing) await api.put(`/lessons/${editing}`, payload);
      else await api.post(`/courses/${id}/lessons`, payload);
      setMessage(editing ? "Lesson updated." : "New lesson added.");
      reset(await load());
    } catch (e) {
      setError(errorMessage(e));
    } finally {
      setBusy(false);
    }
  }
  async function importPlaylist(event) {
    event.preventDefault();
    setBusy(true);
    setError("");
    setMessage("");
    try {
      const { data } = await api.post(
        `/courses/${id}/import-playlist`,
        { playlistUrl },
        { timeout: 120000 },
      );
      setMessage(data.message);
      reset(await load());
    } catch (e) {
      setError(errorMessage(e));
    } finally {
      setBusy(false);
    }
  }
  async function deleteLesson() {
    setBusy(true);
    setError("");
    try {
      await api.delete(`/lessons/${remove._id}`);
      reset(await load());
      setMessage("Lesson deleted. Student progress has been updated.");
    } catch (e) {
      setError(errorMessage(e));
    } finally {
      setRemove(null);
      setBusy(false);
    }
  }
  const visible = lessons.filter((lesson) =>
    lesson.title.toLowerCase().includes(query.toLowerCase()),
  );
  return (
    <>
      <Link to={`${base}/courses`} className="back-link">
        Back to courses
      </Link>
      <PageIntro
        eyebrow="YOUR COURSE STUDIO"
        title="Build the learning journey"
        description={course?.title}
      >
        <Link to={`/learn/${id}`} className="btn btn-outline-primary">
          Preview course
        </Link>
      </PageIntro>
      <ErrorBox message={error} />
      {message && <SuccessMessage>{message}</SuccessMessage>}
      {loading ? (
        <Loading label="Opening your course studio…" />
      ) : (
        course && (
          <>
            <details className="playlist-import editor-panel">
              <summary>
                <ListVideo size={23} />
                <span>
                  <strong>Import a YouTube playlist</strong>
                  <small>
                    Add video titles and links in their original order
                  </small>
                </span>
              </summary>
              <form onSubmit={importPlaylist} className="mt-3">
                <label htmlFor="import-playlist" className="form-label">
                  Public playlist link
                </label>
                <div className="import-controls">
                  <input
                    id="import-playlist"
                    type="url"
                    className="form-control"
                    required
                    maxLength={500}
                    value={playlistUrl}
                    onChange={(e) => setPlaylistUrl(e.target.value)}
                    placeholder="https://www.youtube.com/playlist?list=…"
                  />
                  <button className="btn btn-primary" disabled={busy}>
                    {busy ? "Working…" : "Import lessons"}
                  </button>
                </div>
                <p className="form-text mb-0">
                  Existing lessons stay in place. Duplicate links are skipped.
                  Automatic import must be enabled by your administrator;
                  individual video links always work.
                </p>
              </form>
            </details>
            <div className="row g-4 mt-1">
              <div className="col-xl-5">
                <div className="editor-panel">
                  <div className="section-heading compact">
                    <h2>Course lessons</h2>
                    <span>{lessons.length} total</span>
                  </div>
                  {lessons.length > 5 && (
                    <SearchInput
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                      placeholder="Search lesson titles"
                    />
                  )}
                  <div className="editor-lesson-list">
                    {visible.map((lesson, index) => (
                      <div
                        className={`editor-lesson ${editing === lesson._id ? "editing" : ""}`}
                        key={lesson._id}
                      >
                        <span className="lesson-number">
                          {query ? lesson.order : index + 1}
                        </span>
                        <div>
                          <h3>{lesson.title}</h3>
                          <span className="file-caption">
                            {lesson.videoUrl ? (
                              <>
                                <Video size={14} /> Video lesson
                              </>
                            ) : (
                              <>
                                <FileText size={14} /> Reading lesson
                              </>
                            )}
                          </span>
                        </div>
                        <div className="lesson-row-actions">
                          <button
                            type="button"
                            className="icon-button"
                            aria-label={`Edit ${lesson.title}`}
                            onClick={() => edit(lesson)}
                            disabled={busy}
                          >
                            <Pencil size={16} />
                          </button>
                          <button
                            type="button"
                            className="icon-button danger"
                            aria-label={`Delete ${lesson.title}`}
                            onClick={() => setRemove(lesson)}
                            disabled={busy}
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                  {!visible.length && (
                    <EmptyState
                      title={
                        query
                          ? "No matching lessons"
                          : "Your first lesson starts here"
                      }
                      description="Add a title and a YouTube video link using the form."
                    />
                  )}
                </div>
              </div>
              <div className="col-xl-7">
                <form
                  id="lesson-form"
                  className="editor-panel lesson-form"
                  onSubmit={save}
                >
                  <div className="section-heading compact">
                    <h2>{editing ? "Edit lesson" : "Add a video lesson"}</h2>
                    {editing && (
                      <button
                        type="button"
                        className="btn btn-sm btn-light"
                        disabled={busy}
                        onClick={() => reset()}
                      >
                        <Plus size={16} />
                        New lesson
                      </button>
                    )}
                  </div>
                  <p>
                    A useful title. A video worth watching. That’s all you need.
                  </p>
                  <fieldset disabled={busy}>
                    <label htmlFor="lesson-title" className="form-label">
                      Lesson title
                    </label>
                    <input
                      id="lesson-title"
                      className="form-control mb-3"
                      required
                      minLength={3}
                      maxLength={180}
                      placeholder="e.g. Getting started with React components"
                      value={form.title}
                      onChange={(e) =>
                        setForm({ ...form, title: e.target.value })
                      }
                    />
                    <label htmlFor="lesson-video" className="form-label">
                      YouTube video link
                    </label>
                    <input
                      id="lesson-video"
                      type="url"
                      className="form-control"
                      maxLength={500}
                      placeholder="https://www.youtube.com/watch?v=…"
                      value={form.videoUrl}
                      onChange={(e) =>
                        setForm({ ...form, videoUrl: e.target.value })
                      }
                    />
                    <p className="form-text">
                      Use an individual video link. The video will appear in the
                      lesson viewer.
                    </p>
                    <details className="lesson-extras">
                      <summary>Optional notes, order & PDF resource</summary>
                      <div className="mt-3">
                        <label htmlFor="lesson-order" className="form-label">
                          Lesson order
                        </label>
                        <input
                          id="lesson-order"
                          type="number"
                          className="form-control mb-3"
                          required
                          min={1}
                          max={1000}
                          value={form.order}
                          onChange={(e) =>
                            setForm({ ...form, order: e.target.value })
                          }
                        />
                        <label htmlFor="lesson-content" className="form-label">
                          Lesson notes
                        </label>
                        <textarea
                          id="lesson-content"
                          className="form-control mb-3"
                          rows={6}
                          maxLength={20000}
                          value={form.content}
                          onChange={(e) =>
                            setForm({ ...form, content: e.target.value })
                          }
                          placeholder="Add a short explanation, exercise or useful reminder."
                        />
                        <label htmlFor="resource" className="form-label">
                          PDF resource
                        </label>
                        <input
                          key={fileKey}
                          id="resource"
                          type="file"
                          accept="application/pdf,.pdf"
                          className="form-control"
                          onChange={(e) => setFile(e.target.files?.[0] || null)}
                        />
                        <p className="form-text">
                          Up to 2 MB. Leave empty to keep an existing PDF. For a
                          reading-only lesson, add at least 20 characters of
                          notes and leave the video blank.
                        </p>
                      </div>
                    </details>
                    <button className="btn btn-primary mt-4">
                      <Save size={17} />
                      {busy
                        ? "Saving…"
                        : editing
                          ? "Save changes"
                          : "Add lesson"}
                    </button>
                  </fieldset>
                </form>
              </div>
            </div>
          </>
        )
      )}
      <ConfirmDialog
        show={Boolean(remove)}
        title="Delete this lesson?"
        busy={busy}
        onCancel={() => setRemove(null)}
        onConfirm={deleteLesson}
      >
        <p>{remove?.title}</p>
        <p>
          Its PDF resource will be removed and student progress recalculated.
        </p>
      </ConfirmDialog>
    </>
  );
}
