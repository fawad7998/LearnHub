import { useEffect, useState } from "react";
import { Check, RefreshCw, ShieldCheck, X } from "lucide-react";
import api, { errorMessage } from "../services/api";
import {
  Avatar,
  ConfirmDialog,
  EmptyState,
  ErrorBox,
  Loading,
  PageIntro,
  SuccessMessage,
} from "../components/Shared";

export default function TeacherApprovals() {
  const [teachers, setTeachers] = useState([]);
  const [total, setTotal] = useState(0);
  const [status, setStatus] = useState("pending");
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [decline, setDecline] = useState(null);
  async function load() {
    setLoading(true);
    setError("");
    try {
      const { data } = await api.get("/admin/teachers", { params: { status } });
      setTeachers(data.teachers);
      setTotal(data.total);
    } catch (error) {
      setError(errorMessage(error));
    } finally {
      setLoading(false);
    }
  }
  useEffect(() => {
    load();
  }, [status]);
  async function review(teacher, decision) {
    setBusy(true);
    setError("");
    setMessage("");
    try {
      const { data } = await api.patch(
        `/admin/teachers/${teacher._id}/approval`,
        { decision },
      );
      setMessage(data.message);
      setDecline(null);
      await load();
    } catch (error) {
      setError(errorMessage(error));
      setDecline(null);
    } finally {
      setBusy(false);
    }
  }
  return (
    <>
      <PageIntro
        eyebrow="A THOUGHTFUL START"
        title="Teacher applications"
        description="Review each name and email before granting access to the teaching workspace."
      >
        <button
          className="btn btn-outline-primary"
          onClick={load}
          disabled={loading || busy}
        >
          <RefreshCw size={17} /> Refresh
        </button>
      </PageIntro>
      <ErrorBox message={error} />
      {message && <SuccessMessage>{message}</SuccessMessage>}
      <div className="approval-hint mb-4">
        <ShieldCheck size={22} />
        <p>
          Approval lets a teacher sign in and manage their own courses. Existing
          teacher accounts keep their current access. Paused accounts must also
          be activated in Manage users.
        </p>
      </div>
      <div
        className="filter-tabs mb-4"
        role="group"
        aria-label="Application status"
      >
        {[
          ["pending", "Awaiting review"],
          ["rejected", "Declined"],
        ].map(([value, label]) => (
          <button
            key={value}
            className={status === value ? "active" : ""}
            aria-pressed={status === value}
            disabled={busy}
            onClick={() => setStatus(value)}
          >
            {label}
          </button>
        ))}
      </div>
      {loading ? (
        <Loading label="Loading teacher applications…" />
      ) : teachers.length ? (
        <section className="application-list" aria-label="Teacher applications">
          <p className="form-text">
            {total} {status === "pending" ? "pending" : "declined"} application
            {total === 1 ? "" : "s"}
            {total > teachers.length
              ? ` · Showing the oldest ${teachers.length}`
              : ""}
          </p>
          {teachers.map((teacher) => (
            <article className="application-card" key={teacher._id}>
              <Avatar name={teacher.name} />
              <div className="application-person">
                <h2>{teacher.name}</h2>
                <span className="application-email">{teacher.email}</span>
                <p>
                  Applied{" "}
                  {new Date(
                    teacher.teacherAppliedAt || teacher.createdAt,
                  ).toLocaleDateString(undefined, {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })}
                  {!teacher.isActive ? " · Account paused" : ""}
                </p>
              </div>
              <span
                className={`status-badge ${status === "pending" ? "pending-status" : "inactive-status"}`}
              >
                {status === "pending" ? "Awaiting review" : "Declined"}
              </span>
              <div className="application-actions">
                <button
                  className="btn btn-primary btn-sm"
                  disabled={busy}
                  onClick={() => review(teacher, "approved")}
                  aria-label={`Approve ${teacher.name}`}
                >
                  <Check size={16} /> Approve teacher
                </button>
                {status === "pending" && (
                  <button
                    className="btn btn-outline-primary btn-sm"
                    disabled={busy}
                    onClick={() => setDecline(teacher)}
                    aria-label={`Decline ${teacher.name}`}
                  >
                    <X size={16} /> Decline
                  </button>
                )}
              </div>
            </article>
          ))}
        </section>
      ) : (
        !error && (
          <EmptyState
            icon={ShieldCheck}
            title={
              status === "pending"
                ? "You’re all caught up."
                : "No declined applications."
            }
            description={
              status === "pending"
                ? "New teacher registrations will appear here for your review."
                : "Applications you decline will appear here. You can approve them later."
            }
          />
        )
      )}
      <ConfirmDialog
        show={Boolean(decline)}
        title="Decline this application?"
        confirmLabel="Decline application"
        busy={busy}
        onCancel={() => setDecline(null)}
        onConfirm={() => review(decline, "rejected")}
      >
        <p>
          <strong>{decline?.name}</strong> will not be able to sign in as a
          teacher. You can approve this application later from the Declined tab.
        </p>
      </ConfirmDialog>
    </>
  );
}
