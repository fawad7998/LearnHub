import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Trash2, Pause, Play } from "lucide-react";
import api, { errorMessage } from "../services/api";
import {
  PageIntro,
  ErrorBox,
  Loading,
  Avatar,
  ConfirmDialog,
  SearchInput,
  SuccessMessage,
  EmptyState,
} from "../components/Shared";
export default function ManageUsers() {
  const [users, setUsers] = useState([]);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [remove, setRemove] = useState(null);
  const [busy, setBusy] = useState(false);
  function load() {
    api
      .get("/admin/users")
      .then(({ data }) => setUsers(data.users))
      .catch((e) => setError(errorMessage(e)))
      .finally(() => setLoading(false));
  }
  useEffect(load, []);
  async function update(user, input) {
    setBusy(true);
    setError("");
    setMessage("");
    try {
      await api.patch(`/admin/users/${user._id}`, input);
      setMessage(
        `${user.name}’s account updated. They will need to sign in again.`,
      );
      load();
    } catch (e) {
      setError(errorMessage(e));
    } finally {
      setBusy(false);
    }
  }
  async function deleteUser() {
    setBusy(true);
    setError("");
    try {
      await api.delete(`/admin/users/${remove._id}`);
      setMessage("User removed.");
      setRemove(null);
      load();
    } catch (e) {
      setError(errorMessage(e));
      setRemove(null);
    } finally {
      setBusy(false);
    }
  }
  const visible = users.filter((u) =>
    `${u.name} ${u.email} ${u.role}`
      .toLowerCase()
      .includes(query.toLowerCase()),
  );
  return (
    <>
      <PageIntro
        eyebrow="PEOPLE MAKE THE DIFFERENCE"
        title="Your learning community"
        description="Manage accounts and give teachers the space to teach."
      />
      <div className="approval-hint mb-4">
        <p>
          New teachers need approval before signing in.{" "}
          <Link to="/dashboard/admin/teachers">
            Review teacher applications →
          </Link>
        </p>
      </div>
      <ErrorBox message={error} />
      {message && <SuccessMessage>{message}</SuccessMessage>}
      <div className="editor-panel">
        <div className="section-heading compact">
          <h2>
            All users <span className="count-badge">{users.length}</span>
          </h2>
          <SearchInput
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search people or roles"
          />
        </div>
        {loading ? (
          <Loading />
        ) : visible.length ? (
          <div className="table-responsive">
            <table className="table users-table align-middle">
              <thead>
                <tr>
                  <th scope="col">Person</th>
                  <th scope="col">Role</th>
                  <th scope="col">Status</th>
                  <th scope="col">Joined</th>
                  <th scope="col" className="text-end">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {visible.map((user) => (
                  <tr key={user._id}>
                    <td>
                      <div className="user-cell">
                        <Avatar name={user.name} />
                        <div>
                          <strong>{user.name}</strong>
                          <span>{user.email}</span>
                        </div>
                      </div>
                    </td>
                    <td>
                      {user.role === "admin" ? (
                        <span className="role-pill">Admin</span>
                      ) : (
                        <select
                          className="form-select form-select-sm role-select"
                          value={user.role}
                          aria-label={`Role for ${user.name}`}
                          disabled={busy}
                          onChange={(e) =>
                            update(user, {
                              role: e.target.value,
                            })
                          }
                        >
                          <option value="student">Student</option>
                          <option value="instructor">Teacher</option>
                        </select>
                      )}
                    </td>
                    <td>
                      <span
                        className={`status-badge ${user.role === "instructor" && user.teacherApproval === "pending" ? "pending-status" : user.isActive && user.teacherApproval !== "rejected" ? "active-status" : "inactive-status"}`}
                      >
                        {!user.isActive
                          ? "Paused"
                          : user.role === "instructor" &&
                              user.teacherApproval === "pending"
                            ? "Awaiting approval"
                            : user.role === "instructor" &&
                                user.teacherApproval === "rejected"
                              ? "Declined"
                              : "Active"}
                      </span>
                    </td>
                    <td className="date-cell">
                      {new Date(user.createdAt).toLocaleDateString(undefined, {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </td>
                    <td>
                      <div className="table-actions">
                        {user.role !== "admin" && (
                          <>
                            <button
                              className="icon-button bordered"
                              disabled={busy}
                              aria-label={`${user.isActive ? "Pause" : "Activate"} ${user.name}`}
                              onClick={() =>
                                update(user, {
                                  isActive: !user.isActive,
                                })
                              }
                            >
                              {user.isActive ? (
                                <Pause size={16} />
                              ) : (
                                <Play size={16} />
                              )}
                            </button>
                            <button
                              className="icon-button bordered danger"
                              disabled={busy}
                              aria-label={`Delete ${user.name}`}
                              onClick={() => setRemove(user)}
                            >
                              <Trash2 size={16} />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <EmptyState
            title="No people found."
            description="Try a different name, email, or role."
          />
        )}
      </div>
      <ConfirmDialog
        show={Boolean(remove)}
        title="Delete this account?"
        busy={busy}
        onCancel={() => setRemove(null)}
        onConfirm={deleteUser}
      >
        <p>
          <strong>{remove?.name}</strong> and their enrollment records will be
          removed. Instructors with existing courses must have those courses
          removed first.
        </p>
      </ConfirmDialog>
    </>
  );
}
