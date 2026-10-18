import { useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  BookOpen,
  HeartHandshake,
  Compass,
  GraduationCap,
  Presentation,
  Send,
  MessageSquare,
  CircleHelp,
  MonitorPlay,
  CheckCircle2,
} from "lucide-react";
import api, { errorMessage } from "../services/api";
import { useAuth, dashboardFor } from "../context/AuthContext";
import { ErrorBox, SuccessMessage } from "../components/Shared";
import { faqs } from "../config/faqs";

export function PageHero({ eyebrow, title, description }) {
  return (
    <section className="public-page-hero">
      <div className="container">
        <div className="breadcrumb-line">
          <Link to="/">Home</Link>
          <span>/</span>
          {eyebrow}
        </div>
        <span className="eyebrow">{eyebrow}</span>
        <h1>{title}</h1>
        <p>{description}</p>
      </div>
    </section>
  );
}
export function About() {
  return (
    <>
      <PageHero
        eyebrow="ABOUT LEARNHUB"
        title={
          <>
            A place for curious minds.
            <br />A path to what comes next.
          </>
        }
        description="LearnHub brings courses, video lessons and your learning progress into one welcoming space."
      />
      <section className="container section-space">
        <div className="row align-items-center g-5">
          <div className="col-lg-6">
            <img
              className="story-image"
              src="/images/learning-path.svg"
              width="700"
              height="520"
              alt="A learning journey from exploring an idea to completing a lesson"
            />
          </div>
          <div className="col-lg-6">
            <span className="eyebrow">WHY WE’RE HERE</span>
            <h2>
              Learning should feel
              <br />
              like a possibility.
            </h2>
            <p>
              There is a lot to learn online. Finding a clear order, keeping
              track of progress, and knowing what to do next can make all the
              difference.
            </p>
            <p>
              LearnHub gives students a focused place to learn and teachers a
              simple place to organize what they know. Start with a course, take
              it one lesson at a time, and build a habit that stays with you.
            </p>
            <Link to="/courses" className="btn btn-primary">
              Find your next course <ArrowRight size={18} />
            </Link>
          </div>
        </div>
      </section>
      <section className="steps-section">
        <div className="container">
          <span className="eyebrow">WHAT WE BELIEVE IN</span>
          <h2 className="mb-4">A few things worth building around.</h2>
          <div className="steps-grid">
            {[
              {
                icon: Compass,
                title: "A clear direction",
                text: "Ordered lessons help you spend more time learning and less time searching for what comes next.",
              },
              {
                icon: BookOpen,
                title: "Room for your pace",
                text: "Revisit a lesson, pause to practice, and make progress in a way that fits your life.",
              },
              {
                icon: HeartHandshake,
                title: "Credit where it belongs",
                text: "Curated videos stay with their original creators. Course pages identify the source and link to the original playlist.",
              },
            ].map(({ icon: Icon, title, text }) => (
              <article className="step-card" key={title}>
                <span className="feature-icon">
                  <Icon size={27} />
                </span>
                <h3>{title}</h3>
                <p>{text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>
      <section className="container section-space">
        <div className="row g-5 align-items-center">
          <div className="col-lg-5">
            <span className="eyebrow">DIFFERENT ROLES. ONE CLEAR PURPOSE.</span>
            <h2>
              A place to learn.
              <br />A space to teach.
            </h2>
            <p>
              LearnHub gives each person the tools they need, with a clear
              separation between learning, teaching, and managing the platform.
            </p>
            <Link className="text-link" to="/how-it-works">
              See how it works
              <ArrowRight size={17} />
            </Link>
          </div>
          <div className="col-lg-7">
            <div className="feature-stack">
              {[
                {
                  icon: GraduationCap,
                  title: "For students",
                  text: "Explore topics, follow video lessons, and see the progress you have made.",
                },
                {
                  icon: Presentation,
                  title: "For teachers",
                  text: "Apply for approval, organize your course material, and manage your own lessons.",
                },
                {
                  icon: HeartHandshake,
                  title: "For the community",
                  text: "Admin reviews teacher applications, manages accounts, and responds to messages.",
                },
              ].map(({ icon: Icon, title, text }) => (
                <div key={title}>
                  <span>
                    <Icon size={23} />
                  </span>
                  <div>
                    <h3>{title}</h3>
                    <p>{text}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
      <section className="container section-space about-credit-section">
        <div className="source-credit">
          <h2>Made to help you learn.</h2>
          <p>
            LearnHub is an independent MERN learning platform created as a
            student final project. It is not affiliated with CodeWithHarry,
            Microsoft or YouTube. The initial free catalog curates their public
            video playlists; all videos remain hosted by YouTube and belong to
            their respective creators.
          </p>
          <p className="mb-0">
            Teachers can also create original courses and add their own video
            lessons, notes and PDFs.
          </p>
        </div>
      </section>
    </>
  );
}
export function HowItWorks() {
  const { user } = useAuth();
  return (
    <>
      <PageHero
        eyebrow="HOW IT WORKS"
        title={
          <>
            A clear path.
            <br />
            Your kind of progress.
          </>
        }
        description="Choose how you want to join. Your workspace takes care of the rest."
      />
      <section className="container section-space">
        <div className="row g-4">
          {[
            {
              role: "Student",
              icon: GraduationCap,
              description: "Build a skill, one lesson at a time.",
              steps: [
                "Register as a Student, then log in.",
                "Browse courses and enroll in one you like.",
                "Watch lessons, open resources and practice.",
                "Mark lessons complete and continue from your dashboard.",
              ],
              url: "/register",
            },
            {
              role: "Teacher",
              icon: Presentation,
              description: "Give someone a place to begin.",
              steps: [
                "Register as a Teacher using your real email.",
                "Wait for admin approval, then log in.",
                "Create a course and choose its cover icon.",
                "Add lesson titles and YouTube video links.",
                "Add optional notes or PDFs and manage your courses.",
              ],
              url: "/register?role=instructor",
            },
          ].map(({ role, icon: Icon, description, steps, url }) => (
            <div className="col-lg-6" key={role}>
              <article className="path-card">
                <span className="feature-icon">
                  <Icon size={32} />
                </span>
                <h2>Join as a {role.toLowerCase()}</h2>
                <p>{description}</p>
                <ol>
                  {steps.map((step) => (
                    <li key={step}>{step}</li>
                  ))}
                </ol>
                <Link
                  className="btn btn-primary"
                  to={user ? dashboardFor(user) : url}
                >
                  {user
                    ? "Open my workspace"
                    : `Create ${role.toLowerCase()} account`}
                  <ArrowRight size={18} />
                </Link>
              </article>
            </div>
          ))}
        </div>
        <div className="workflow-next">
          <span className="eyebrow">AFTER YOUR FIRST LOGIN</span>
          <h2>Make the workspace part of your routine.</h2>
          <div className="quality-grid">
            <article>
              <MonitorPlay size={26} />
              <h3>Open a focused lesson</h3>
              <p>
                Use the lesson list to move through a course. Video links,
                notes, and available PDFs stay together.
              </p>
            </article>
            <article>
              <CheckCircle2 size={26} />
              <h3>Keep your place</h3>
              <p>
                Students can mark lessons complete and return from their
                dashboard. Your progress stays with your account.
              </p>
            </article>
          </div>
          <Link to="/study-guide" className="text-link mt-4">
            Find a study routine
            <ArrowRight size={17} />
          </Link>
        </div>
        <div className="help-callout">
          <CircleHelp size={26} />
          <div>
            <h3>Need a hand getting started?</h3>
            <p>
              Find an answer in the help center, or leave a message for the
              administrator.
            </p>
          </div>
          <Link className="btn btn-outline-primary" to="/help">
            Get help
          </Link>
        </div>
      </section>
    </>
  );
}
export function Help() {
  const [query, setQuery] = useState("");
  const visible = faqs.filter((item) =>
    `${item.question} ${item.answer}`
      .toLowerCase()
      .includes(query.toLowerCase()),
  );
  return (
    <>
      <PageHero
        eyebrow="HELP CENTER"
        title="A little help goes a long way."
        description="Answers for your first login, your next lesson and everything in between."
      />
      <section className="container help-content section-space">
        <div className="help-shortcuts">
          <Link to="/forgot-password">
            <CircleHelp size={23} />
            <strong>Reset a password</strong>
            <span>Verify your real email with a PIN.</span>
          </Link>
          <Link to="/teach">
            <Presentation size={23} />
            <strong>Become a teacher</strong>
            <span>Learn about applications and approval.</span>
          </Link>
          <Link to="/study-guide">
            <BookOpen size={23} />
            <strong>Build a learning habit</strong>
            <span>Plan a useful study session.</span>
          </Link>
        </div>
        <label htmlFor="help-search" className="form-label">
          What would you like to know?
        </label>
        <input
          id="help-search"
          type="search"
          className="form-control mb-4"
          placeholder="Search questions about courses, videos or accounts"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <div className="faq-list">
          {visible.map((item) => (
            <details key={item.question}>
              <summary>{item.question}</summary>
              <p>{item.answer}</p>
            </details>
          ))}
        </div>
        {!visible.length && (
          <p>
            No matching answers. Try a different word or send us your question.
          </p>
        )}
        <div className="help-callout">
          <MessageSquare size={28} />
          <div>
            <h3>Still have a question?</h3>
            <p>Leave a message and tell us what you need help with.</p>
          </div>
          <Link to="/contact" className="btn btn-primary">
            Contact us
          </Link>
        </div>
      </section>
    </>
  );
}
export function Contact() {
  const { user } = useAuth();
  const [form, setForm] = useState({
    name: user?.name || "",
    email: user?.email || "",
    subject: "",
    message: "",
  });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const update = (event) =>
    setForm({ ...form, [event.target.name]: event.target.value });
  async function submit(event) {
    event.preventDefault();
    setBusy(true);
    setError("");
    setMessage("");
    try {
      const { data } = await api.post("/contact", form);
      setMessage(data.message);
      setForm({ ...form, subject: "", message: "" });
    } catch (e) {
      setError(errorMessage(e));
    } finally {
      setBusy(false);
    }
  }
  return (
    <>
      <PageHero
        eyebrow="CONTACT US"
        title={
          <>
            Let’s keep the
            <br />
            conversation going.
          </>
        }
        description="A question, an idea, or a course that needs attention? We’re listening."
      />
      <section className="container section-space">
        <div className="row g-5">
          <div className="col-lg-5">
            <span className="eyebrow">TELL US WHAT’S ON YOUR MIND</span>
            <h2>
              Your next step
              <br />
              shouldn’t be a roadblock.
            </h2>
            <p>
              Use the form for account help, course feedback or a suggestion.
              Your message goes to the LearnHub administrator’s inbox.
            </p>
            <div className="contact-topics">
              {[
                {
                  icon: CircleHelp,
                  title: "Account & learning help",
                  text: "Tell us which page or course you need help with.",
                },
                {
                  icon: MonitorPlay,
                  title: "A video or course issue",
                  text: "Include the course name and lesson title.",
                },
                {
                  icon: CheckCircle2,
                  title: "Ideas & feedback",
                  text: "Help us make the learning experience better.",
                },
              ].map(({ icon: Icon, title, text }) => (
                <div key={title}>
                  <Icon size={24} />
                  <div>
                    <h3>{title}</h3>
                    <p>{text}</p>
                  </div>
                </div>
              ))}
            </div>
            <Link className="text-link" to="/help">
              Browse common questions <ArrowRight size={17} />
            </Link>
          </div>
          <div className="col-lg-7">
            <form className="editor-panel contact-form" onSubmit={submit}>
              <h2>Send a message</h2>
              <ErrorBox message={error} />
              {message && <SuccessMessage>{message}</SuccessMessage>}
              <fieldset disabled={busy}>
                <div className="row g-3">
                  <div className="col-sm-6">
                    <label htmlFor="contact-name" className="form-label">
                      Your name
                    </label>
                    <input
                      id="contact-name"
                      name="name"
                      autoComplete="name"
                      className="form-control"
                      value={form.name}
                      onChange={update}
                      required
                      minLength={2}
                      maxLength={80}
                    />
                  </div>
                  <div className="col-sm-6">
                    <label htmlFor="contact-email" className="form-label">
                      Email address
                    </label>
                    <input
                      id="contact-email"
                      name="email"
                      type="email"
                      autoComplete="email"
                      className="form-control"
                      value={form.email}
                      onChange={update}
                      required
                      maxLength={254}
                    />
                  </div>
                  <div className="col-12">
                    <label htmlFor="contact-subject" className="form-label">
                      Subject
                    </label>
                    <input
                      id="contact-subject"
                      name="subject"
                      className="form-control"
                      value={form.subject}
                      onChange={update}
                      required
                      minLength={3}
                      maxLength={120}
                    />
                  </div>
                  <div className="col-12">
                    <label htmlFor="contact-message" className="form-label">
                      Message
                    </label>
                    <textarea
                      id="contact-message"
                      name="message"
                      className="form-control"
                      rows={6}
                      value={form.message}
                      onChange={update}
                      required
                      minLength={10}
                      maxLength={4000}
                      placeholder="How can we help?"
                    />
                  </div>
                </div>
                <p className="form-text mt-3">
                  Share the details we need to help. Please do not include
                  passwords.
                </p>
                <button className="btn btn-primary">
                  <Send size={17} />
                  {busy ? "Sending…" : "Send message"}
                </button>
              </fieldset>
            </form>
          </div>
        </div>
        <div className="contact-guidance">
          <div>
            <span className="eyebrow">BEFORE YOU SEND</span>
            <h2>A few details help us understand.</h2>
            <p>
              Include the page or course name, what you were trying to do, and
              the message you saw. For teacher approval questions, use the email
              from your application.
            </p>
          </div>
          <div>
            <h3>Keep your account details safe.</h3>
            <p>
              Never include your password, a verification PIN, or your database
              connection details. For a forgotten password, use the recovery
              page.
            </p>
            <Link to="/forgot-password" className="text-link">
              Recover your account
              <ArrowRight size={17} />
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
