import { courseIcons } from "../config/courseOptions";
import { Link } from "react-router-dom";
import { Alert, Spinner, Modal, Button } from "react-bootstrap";
import { BookOpen, Clock3, Layers3, CheckCircle2, Search } from "lucide-react";
export function Brand() {
  return (
    <Link className="brand" to="/" aria-label="LearnHub home">
      <span className="brand-symbol">
        <BookOpen size={23} />
      </span>
      <span>
        learn<span className="brand-accent">hub</span>
        <span className="brand-period">.</span>
      </span>
    </Link>
  );
}
export function Loading({ label = "Loading your next chapter…" }) {
  return (
    <div className="loading-state" role="status">
      <Spinner animation="border" size="sm" />
      <span>{label}</span>
    </div>
  );
}
export function ErrorBox({ message, retry }) {
  return message ? (
    <Alert variant="danger" className="error-box" role="alert">
      {message}
      {retry && (
        <button className="btn btn-sm btn-outline-danger ms-3" onClick={retry}>
          Try again
        </button>
      )}
    </Alert>
  ) : null;
}
export function EmptyState({
  title = "Nothing here yet",
  description,
  action,
  icon: Icon = BookOpen,
}) {
  return (
    <div className="empty-state">
      <span className="empty-icon">
        <Icon size={30} />
      </span>
      <h3>{title}</h3>
      <p>{description}</p>
      {action}
    </div>
  );
}
export function PageIntro({ eyebrow, title, description, children }) {
  return (
    <div className="page-intro">
      <div>
        {eyebrow && <span className="eyebrow">{eyebrow}</span>}
        <h1>{title}</h1>
        {description && <p>{description}</p>}
      </div>
      {children}
    </div>
  );
}
export function Avatar({ name = "", large = false }) {
  return (
    <span
      className={`avatar ${large ? "avatar-large" : ""}`}
      aria-hidden="true"
    >
      {name
        .split(" ")
        .slice(0, 2)
        .map((s) => s[0])
        .join("")}
    </span>
  );
}
export function CourseCover({ cover = "react", title, small = false }) {
  const item =
    courseIcons.find((item) => item.value === cover) || courseIcons[3];
  const Icon = item.icon;
  return (
    <div
      className={`course-cover cover-${cover} color-${item.color} ${small ? "cover-small" : ""}`}
      aria-hidden="true"
    >
      <span className="cover-caption">{item.label} / LEARNING SERIES</span>
      <div className="cover-title">
        <span>{title || item.label}</span>
        <Icon size={small ? 32 : 56} strokeWidth={1.4} />
      </div>
      <div className="cover-baseline">
        <span>LEARNHUB</span>
        <span>↗</span>
      </div>
    </div>
  );
}
export function CourseSkeleton({ count = 3 }) {
  return (
    <div role="status" aria-label="Loading courses">
      <span className="visually-hidden">Loading courses…</span>
      <div className="row g-4" aria-hidden="true">
        {Array.from(
          {
            length: count,
          },
          (_, i) => (
            <div className="col-md-6 col-xl-4" key={i}>
              <div className="skeleton-card">
                <div className="skeleton skeleton-cover" />
                <div className="skeleton-copy">
                  <div className="skeleton skeleton-line" />
                  <div className="skeleton skeleton-line short" />
                  <div className="skeleton skeleton-line" />
                </div>
              </div>
            </div>
          ),
        )}
      </div>
    </div>
  );
}
export const priceLabel = (price) =>
  Number(price) === 0 ? "Free" : `PKR ${Number(price).toLocaleString()}`;
export function CourseCard({ course, enrollment }) {
  return (
    <article className="course-card">
      <Link
        to={enrollment ? `/learn/${course._id}` : `/courses/${course._id}`}
        className="cover-link"
        aria-label={`${enrollment ? "Continue" : "View"} ${course.title}`}
      >
        <CourseCover cover={course.cover} title={course.title} />
      </Link>
      <div className="course-card-body">
        <div className="course-tags">
          <span>{course.category}</span>
          <span className="level-badge">{course.level}</span>
        </div>
        <h3>
          <Link
            to={enrollment ? `/learn/${course._id}` : `/courses/${course._id}`}
          >
            {course.title}
          </Link>
        </h3>
        <div className="course-teacher">
          <Avatar name={course.sourceAuthor || course.instructor?.name} />
          <span>
            {course.sourceAuthor ||
              course.instructor?.name ||
              "LearnHub teacher"}
          </span>
        </div>
        {enrollment ? (
          <>
            <div className="progress-caption">
              <span>
                {enrollment.progress === 100
                  ? "Course completed"
                  : "Your progress"}
              </span>
              <strong>{enrollment.progress}%</strong>
            </div>
            <div
              className="progress"
              role="progressbar"
              aria-label="Course progress"
              aria-valuenow={enrollment.progress}
              aria-valuemin={0}
              aria-valuemax={100}
            >
              <div
                className="progress-bar"
                style={{
                  width: `${enrollment.progress}%`,
                }}
              />
            </div>
            <Link
              to={`/learn/${course._id}`}
              className="btn btn-outline-primary w-100 mt-3"
            >
              {enrollment.progress === 100
                ? "Review course"
                : "Continue learning"}
            </Link>
          </>
        ) : (
          <div className="course-card-footer">
            <span>
              <Clock3 size={15} />
              {course.duration}
            </span>
            <span>
              <Layers3 size={15} />
              {course.lessonCount || 0} lessons
            </span>
            <strong>{priceLabel(course.price)}</strong>
          </div>
        )}
      </div>
    </article>
  );
}
export function ConfirmDialog({
  show,
  title,
  children,
  busy,
  onCancel,
  onConfirm,
  confirmLabel = "Delete",
}) {
  return (
    <Modal show={show} onHide={busy ? undefined : onCancel} centered>
      <Modal.Header closeButton={!busy}>
        <Modal.Title>{title}</Modal.Title>
      </Modal.Header>
      <Modal.Body>{children}</Modal.Body>
      <Modal.Footer>
        <Button variant="light" disabled={busy} onClick={onCancel}>
          Cancel
        </Button>
        <Button variant="danger" disabled={busy} onClick={onConfirm}>
          {busy ? "Working…" : confirmLabel}
        </Button>
      </Modal.Footer>
    </Modal>
  );
}
export function SuccessMessage({ children }) {
  return (
    <Alert variant="success" className="d-flex align-items-center gap-2">
      <CheckCircle2 size={18} />
      {children}
    </Alert>
  );
}
export function SearchInput({
  value,
  onChange,
  placeholder = "Find your next course",
}) {
  return (
    <div className="search-input">
      <Search size={19} />
      <input
        type="search"
        className="form-control"
        aria-label={placeholder}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
      />
    </div>
  );
}
