import { useState } from "react";
import { Link, useNavigate, useLocation, Navigate } from "react-router-dom";
import {
  Eye,
  EyeOff,
  Check,
  BookOpen,
  GraduationCap,
  Presentation,
} from "lucide-react";
import { useAuth, dashboardFor } from "../context/AuthContext";
import { ErrorBox, Loading, SuccessMessage } from "../components/Shared";
import api, { errorMessage } from "../services/api";
export default function Auth({ register = false }) {
  const { user, loading, signIn } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState({
    name: "",
    email: location.state?.email || "",
    password: "",
    role:
      new URLSearchParams(location.search).get("role") === "instructor"
        ? "instructor"
        : "student",
  });
  const [show, setShow] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  if (loading) return <Loading />;
  if (user) return <Navigate to={dashboardFor(user)} replace />;
  async function submit(e) {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      if (register) {
        const { data } = await api.post("/register", form);
        navigate("/login", {
          replace: true,
          state: {
            registered: true,
            requiresApproval: data.requiresApproval,
            registrationMessage: data.message,
            email: form.email,
            from: location.state?.from,
          },
        });
        return;
      }
      const loggedIn = await signIn({
        email: form.email,
        password: form.password,
      });
      const from = location.state?.from;
      navigate(
        from?.startsWith("/courses/") || from?.startsWith("/learn/")
          ? from
          : dashboardFor(loggedIn),
        { replace: true },
      );
    } catch (e) {
      setError(errorMessage(e));
    } finally {
      setBusy(false);
    }
  }
  const update = (e) => setForm({ ...form, [e.target.name]: e.target.value });
  return (
    <div className="container auth-container">
      <div className="auth-shell">
        <aside className="auth-story">
          <span className="eyebrow">YOUR NEXT CHAPTER</span>
          <h1>
            {register
              ? "A fresh start.\nA new possibility."
              : "Good to see\nyou again."}
          </h1>
          <p>
            {register
              ? "Give your curiosity somewhere to grow."
              : "Your next lesson is waiting. Let’s keep the progress going."}
          </p>
          <div className="auth-story-icon">
            <BookOpen size={76} strokeWidth={1} />
          </div>
          <div className="auth-story-checks">
            <span>
              <Check size={17} />
              Learn at your own pace
            </span>
            <span>
              <Check size={17} />
              Pick up where you left off
            </span>
            <span>
              <Check size={17} />
              Build skills, one lesson at a time
            </span>
          </div>
          <span className="auth-footnote">
            Small steps make a real difference.
          </span>
        </aside>
        <div className="auth-form-wrap">
          <span className="eyebrow">LET’S GET YOU STARTED</span>
          <h2>{register ? "Create your account" : "Welcome back"}</h2>
          <p>
            {register
              ? "Your first step toward something new."
              : "Sign in to your LearnHub account."}
          </p>
          <ErrorBox message={error} />
          {location.state?.registered && (
            <SuccessMessage>
              {location.state.registrationMessage ||
                "Account created. Log in to open your dashboard."}
            </SuccessMessage>
          )}
          <form onSubmit={submit}>
            {register && (
              <fieldset className="role-picker">
                <legend>I want to join as a</legend>
                {[
                  {
                    value: "student",
                    label: "Student",
                    detail: "Watch, practice, grow",
                    icon: GraduationCap,
                  },
                  {
                    value: "instructor",
                    label: "Teacher",
                    detail: "Create and share courses",
                    icon: Presentation,
                  },
                ].map(({ value, label, detail, icon: Icon }) => (
                  <label
                    key={value}
                    className={form.role === value ? "selected" : ""}
                  >
                    <input
                      type="radio"
                      name="role"
                      value={value}
                      checked={form.role === value}
                      onChange={update}
                    />
                    <Icon size={23} />
                    <strong>{label}</strong>
                    <small>{detail}</small>
                  </label>
                ))}
              </fieldset>
            )}

            {register && (
              <div className="mb-3">
                <label htmlFor="name" className="form-label">
                  Full name
                </label>
                <input
                  id="name"
                  name="name"
                  className="form-control"
                  placeholder="Your full name"
                  value={form.name}
                  onChange={update}
                  autoComplete="name"
                  required
                  minLength={2}
                  maxLength={80}
                />
              </div>
            )}
            <div className="mb-3">
              <label htmlFor="email" className="form-label">
                Email address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                className="form-control"
                placeholder="you@example.com"
                value={form.email}
                onChange={update}
                autoComplete="email"
                required
              />
            </div>
            <div className="mb-4">
              <label htmlFor="password" className="form-label">
                Password
              </label>
              <div className="password-input">
                <input
                  id="password"
                  name="password"
                  type={show ? "text" : "password"}
                  className="form-control"
                  placeholder={
                    register
                      ? "Create a strong password"
                      : "Enter your password"
                  }
                  value={form.password}
                  onChange={update}
                  autoComplete={register ? "new-password" : "current-password"}
                  required
                  minLength={register ? 8 : 1}
                />
                <button
                  type="button"
                  className="icon-button"
                  aria-label={show ? "Hide password" : "Show password"}
                  onClick={() => setShow(!show)}
                >
                  {show ? <EyeOff size={19} /> : <Eye size={19} />}
                </button>
              </div>
              {register && (
                <div className="form-text">
                  Use at least 8 characters. You will log in after creating your
                  account
                  {form.role === "instructor"
                    ? " and receiving admin approval"
                    : ""}
                  .
                </div>
              )}
            </div>
            {!register && (
              <div className="forgot-password-link">
                <Link to="/forgot-password" state={{ email: form.email }}>
                  Forgot password?
                </Link>
              </div>
            )}
            {register && form.role === "instructor" && (
              <div className="approval-hint" role="note">
                <Presentation size={20} />
                <p>
                  <strong>Teachers join after a review.</strong> Submit your
                  account details. An admin will approve your application before
                  you can sign in and create courses.
                </p>
              </div>
            )}
            <button className="btn btn-primary w-100" disabled={busy}>
              {busy
                ? "Please wait…"
                : register
                  ? form.role === "instructor"
                    ? "Submit teacher application"
                    : "Create account"
                  : "Log in"}
            </button>
          </form>
          <p className="auth-switch">
            {register ? "Already have an account?" : "New to LearnHub?"}{" "}
            <Link to={register ? "/login" : "/register"}>
              {register ? "Log in" : "Create an account"}
            </Link>
          </p>
          <div className="auth-help">
            {register
              ? "Learn something new. Make something yours."
              : "Students, teachers, and admins sign in here."}
          </div>
        </div>
      </div>
    </div>
  );
}
