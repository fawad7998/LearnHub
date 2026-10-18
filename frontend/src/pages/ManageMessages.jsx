import { useEffect, useState } from "react";
import { Mail, CheckCircle2, RotateCcw } from "lucide-react";
import api, { errorMessage } from "../services/api";
import { PageIntro, ErrorBox, Loading, EmptyState } from "../components/Shared";

export default function ManageMessages() {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(null);
  const [filter, setFilter] = useState("new");
  function load() {
    setLoading(true);
    setError("");
    api
      .get("/admin/messages")
      .then(({ data }) => setMessages(data.messages))
      .catch((e) => setError(errorMessage(e)))
      .finally(() => setLoading(false));
  }
  useEffect(load, []);
  async function update(item) {
    setBusy(item._id);
    setError("");
    try {
      const { data } = await api.patch(`/admin/messages/${item._id}`, {
        status: item.status === "new" ? "resolved" : "new",
      });
      setMessages((current) =>
        current.map((message) =>
          message._id === item._id ? data.message : message,
        ),
      );
    } catch (e) {
      setError(errorMessage(e));
    } finally {
      setBusy(null);
    }
  }
  const visible = messages.filter(
    (message) => filter === "all" || message.status === filter,
  );
  return (
    <>
      <PageIntro
        eyebrow="LISTEN & HELP"
        title="Your inbox"
        description="Questions and feedback submitted through the contact page."
      />
      <ErrorBox message={error} retry={load} />
      <div className="filter-tabs mb-4">
        {["new", "resolved", "all"].map((value) => (
          <button
            className={filter === value ? "active" : ""}
            key={value}
            onClick={() => setFilter(value)}
            aria-pressed={filter === value}
          >
            {value === "all"
              ? "All messages"
              : value === "new"
                ? "New messages"
                : "Resolved"}
          </button>
        ))}
      </div>
      {loading ? (
        <Loading label="Opening your inbox…" />
      ) : visible.length ? (
        <div className="message-list">
          {visible.map((message) => (
            <article key={message._id} className="editor-panel">
              <div className="message-heading">
                <div>
                  <span
                    className={`status-badge ${message.status === "new" ? "active-status" : ""}`}
                  >
                    {message.status}
                  </span>
                  <h2>{message.subject}</h2>
                </div>
                <time dateTime={message.createdAt}>
                  {new Date(message.createdAt).toLocaleDateString()}
                </time>
              </div>
              <p className="message-author">
                <Mail size={16} />
                {message.name} ·{" "}
                <a href={`mailto:${message.email}`}>{message.email}</a>
              </p>
              <p className="message-body">{message.message}</p>
              <button
                className="btn btn-outline-primary"
                disabled={busy === message._id}
                onClick={() => update(message)}
              >
                {message.status === "new" ? (
                  <CheckCircle2 size={17} />
                ) : (
                  <RotateCcw size={17} />
                )}{" "}
                {busy === message._id
                  ? "Saving…"
                  : message.status === "new"
                    ? "Mark resolved"
                    : "Reopen message"}
              </button>
            </article>
          ))}
        </div>
      ) : (
        !error && (
          <EmptyState
            title="You’re all caught up."
            description="Messages matching this view will appear here."
          />
        )
      )}
    </>
  );
}
