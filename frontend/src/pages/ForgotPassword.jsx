import { useEffect, useRef, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  ArrowLeft,
  CheckCircle2,
  Eye,
  EyeOff,
  KeyRound,
  Mail,
  ShieldCheck,
} from "lucide-react";
import api, { errorMessage } from "../services/api";
import { ErrorBox, SuccessMessage } from "../components/Shared";

export default function ForgotPassword() {
  const location = useLocation();
  const [stage, setStage] = useState("email");
  const [email, setEmail] = useState(location.state?.email || "");
  const [code, setCode] = useState("");
  const [token, setToken] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [show, setShow] = useState(false);
  const [busy, setBusy] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const heading = useRef(null);
  useEffect(() => {
    const timer = setInterval(
      () => setSeconds((value) => Math.max(0, value - 1)),
      1000,
    );
    return () => clearInterval(timer);
  }, []);
  useEffect(() => {
    heading.current?.focus();
  }, [stage]);

  async function requestCode() {
    setBusy(true);
    setError("");
    setMessage("");
    try {
      const { data } = await api.post(
        "/forgot-password",
        { email },
        { timeout: 30000 },
      );
      setMessage(data.message);
      setSeconds(data.resendAfter || 60);
      setCode("");
      setToken("");
      setStage("code");
    } catch (error) {
      setError(errorMessage(error));
    } finally {
      setBusy(false);
    }
  }
  async function submit(event) {
    event.preventDefault();
    if (stage === "email") return requestCode();
    setError("");
    setMessage("");
    if (stage === "password" && password !== confirm) {
      setError("Both passwords must match.");
      return;
    }
    setBusy(true);
    try {
      if (stage === "code") {
        const { data } = await api.post("/verify-reset-code", { email, code });
        setToken(data.resetToken);
        setCode("");
        setStage("password");
      } else {
        await api.post("/reset-password", { email, token, password });
        setToken("");
        setPassword("");
        setConfirm("");
        setStage("done");
      }
    } catch (error) {
      setError(errorMessage(error));
    } finally {
      setBusy(false);
    }
  }
  function startOver() {
    setStage("email");
    setToken("");
    setCode("");
    setPassword("");
    setConfirm("");
    setError("");
    setMessage("");
  }
  const stageIndex = { email: 0, code: 1, password: 2, done: 3 }[stage];
  return (
    <div className="container auth-container">
      <div className="auth-shell recovery-shell">
        <aside className="auth-story">
          <span className="eyebrow">ACCOUNT RECOVERY</span>
          <h1>
            A fresh password.
            <br />
            Back to learning.
          </h1>
          <p>
            Verify your email, choose a new password, and return to your next
            lesson.
          </p>
          <div className="auth-story-icon">
            <ShieldCheck size={76} strokeWidth={1} />
          </div>
          <ol className="recovery-steps">
            {[
              { title: "Your email", icon: Mail },
              { title: "Verification code", icon: ShieldCheck },
              { title: "New password", icon: KeyRound },
            ].map(({ title, icon: Icon }, index) => (
              <li
                key={title}
                className={index <= stageIndex ? "is-current" : ""}
                aria-current={index === stageIndex ? "step" : undefined}
              >
                <span>
                  {index < stageIndex ? (
                    <CheckCircle2 size={19} />
                  ) : (
                    <Icon size={19} />
                  )}
                </span>
                {title}
              </li>
            ))}
          </ol>
          <span className="auth-footnote">
            Keep your verification code private.
          </span>
        </aside>
        <div className="auth-form-wrap">
          <Link to="/login" className="text-link mb-4">
            <ArrowLeft size={16} /> Back to login
          </Link>
          <span className="eyebrow">
            {stage === "done"
              ? "READY TO CONTINUE"
              : `STEP ${stageIndex + 1} OF 3`}
          </span>
          <h2 ref={heading} tabIndex={-1}>
            {
              {
                email: "Forgot your password?",
                code: "Check your inbox",
                password: "Choose a new password",
                done: "Password updated",
              }[stage]
            }
          </h2>
          <p>
            {
              {
                email: "Enter the real email address you used to register.",
                code: `Enter the six-digit code sent to ${email}. It expires in 10 minutes.`,
                password:
                  "Use a strong password that you do not use elsewhere.",
                done: "Your previous sessions have been signed out. Log in again with your new password.",
              }[stage]
            }
          </p>
          <ErrorBox message={error} />
          {message && <SuccessMessage>{message}</SuccessMessage>}
          {stage === "done" ? (
            <div className="recovery-complete">
              <CheckCircle2 size={46} />
              <Link
                to="/login"
                state={{ email }}
                className="btn btn-primary w-100"
              >
                Return to login
              </Link>
              <p className="form-text">
                Teacher accounts still need admin approval before signing in.
              </p>
            </div>
          ) : (
            <form onSubmit={submit}>
              <fieldset disabled={busy}>
                {stage === "email" && (
                  <div className="mb-4">
                    <label className="form-label" htmlFor="recovery-email">
                      Email address
                    </label>
                    <input
                      id="recovery-email"
                      type="email"
                      className="form-control"
                      autoComplete="email"
                      value={email}
                      onChange={(event) => setEmail(event.target.value)}
                      maxLength={254}
                      required
                    />
                    <p className="form-text mt-2">
                      Demo accounts ending in .test keep their original
                      passwords and cannot use recovery.
                    </p>
                  </div>
                )}
                {stage === "code" && (
                  <div className="mb-4">
                    <label className="form-label" htmlFor="recovery-code">
                      Verification code
                    </label>
                    <input
                      id="recovery-code"
                      className="form-control pin-input"
                      type="text"
                      inputMode="numeric"
                      autoComplete="one-time-code"
                      pattern="[0-9]{6}"
                      maxLength={6}
                      value={code}
                      onChange={(event) =>
                        setCode(
                          event.target.value.replace(/\D/g, "").slice(0, 6),
                        )
                      }
                      placeholder="000000"
                      required
                    />
                    <p className="form-text mt-2">
                      You have five attempts per code. Only the most recent code
                      will work.
                    </p>
                  </div>
                )}
                {stage === "password" && (
                  <>
                    <div className="mb-3">
                      <label className="form-label" htmlFor="new-password">
                        New password
                      </label>
                      <div className="password-input">
                        <input
                          id="new-password"
                          className="form-control"
                          type={show ? "text" : "password"}
                          autoComplete="new-password"
                          minLength={8}
                          value={password}
                          onChange={(event) => setPassword(event.target.value)}
                          required
                        />
                        <button
                          type="button"
                          className="icon-button"
                          onClick={() => setShow((value) => !value)}
                          aria-label={show ? "Hide password" : "Show password"}
                        >
                          {show ? <EyeOff size={19} /> : <Eye size={19} />}
                        </button>
                      </div>
                    </div>
                    <div className="mb-4">
                      <label className="form-label" htmlFor="confirm-password">
                        Confirm new password
                      </label>
                      <input
                        id="confirm-password"
                        className="form-control"
                        type={show ? "text" : "password"}
                        autoComplete="new-password"
                        minLength={8}
                        value={confirm}
                        onChange={(event) => setConfirm(event.target.value)}
                        required
                      />
                      <p className="form-text mt-2">
                        At least 8 characters, up to 72 bytes. Your verification
                        is valid for 10 minutes.
                      </p>
                    </div>
                  </>
                )}
                <button type="submit" className="btn btn-primary w-100">
                  {busy
                    ? "Please wait…"
                    : {
                        email: "Send verification code",
                        code: "Verify code",
                        password: "Save new password",
                      }[stage]}
                </button>
                {stage === "code" && (
                  <button
                    type="button"
                    className="btn btn-outline-primary w-100 mt-3"
                    onClick={requestCode}
                    disabled={seconds > 0}
                  >
                    {seconds > 0 ? `Resend code in ${seconds}s` : "Resend code"}
                  </button>
                )}
                {stage !== "email" && (
                  <button
                    type="button"
                    className="recovery-start-over"
                    onClick={startOver}
                  >
                    {stage === "code"
                      ? "Use a different email"
                      : "Start again with a new code"}
                  </button>
                )}
              </fieldset>
            </form>
          )}
          <div className="auth-help">
            Need help? <Link to="/contact">Contact the administrator</Link>.
          </div>
        </div>
      </div>
    </div>
  );
}
