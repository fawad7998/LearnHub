import { useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  ArrowUpRight,
  BookOpen,
  Check,
  CheckCircle2,
  Clock3,
  FileText,
  Lightbulb,
  ListChecks,
  MonitorPlay,
  NotebookPen,
  Presentation,
  ShieldCheck,
  Target,
  UserRoundPlus,
} from "lucide-react";
import { PageHero } from "./PublicPages";
import { learningPaths } from "../config/learningPaths";
import { useAuth, dashboardFor } from "../context/AuthContext";

function PageInvitation({ title, description, to, label }) {
  return (
    <section className="container section-space">
      <div className="home-invitation">
        <div>
          <span className="eyebrow">TAKE THE NEXT STEP</span>
          <h2>{title}</h2>
          <p>{description}</p>
        </div>
        <Link to={to} className="btn btn-primary">
          {label}
          <ArrowRight size={18} />
        </Link>
      </div>
    </section>
  );
}

export function LearningPaths() {
  return (
    <>
      <PageHero
        eyebrow="LEARNING PATHS"
        title={
          <>
            A clear starting point.
            <br />A skill you can build on.
          </>
        }
        description="Choose a direction, explore the related courses, and turn each lesson into something you can do."
      />
      <section className="container section-space">
        <div className="section-heading">
          <div>
            <span className="eyebrow">FIND YOUR DIRECTION</span>
            <h2>Three ways to move forward.</h2>
          </div>
          <p>
            Suggested study sequences.
            <br />
            Your course sets the lesson order.
          </p>
        </div>
        <div className="learning-path-grid">
          {learningPaths.map(
            (
              { title, tag, icon: Icon, query, description, steps, project },
              index,
            ) => (
              <article className="learning-path-card" key={title}>
                <div className="learning-path-top">
                  <Icon size={38} strokeWidth={1.5} />
                  <span>0{index + 1}</span>
                </div>
                <div className="learning-path-body">
                  <span className="eyebrow">{tag}</span>
                  <h2>{title}</h2>
                  <p>{description}</p>
                  <ol className="path-milestones">
                    {steps.map((step) => (
                      <li key={step}>{step}</li>
                    ))}
                  </ol>
                  <div className="practice-brief">
                    <Lightbulb size={19} />
                    <div>
                      <strong>A project to try</strong>
                      <p>{project}</p>
                    </div>
                  </div>
                  <Link
                    to={`/courses?q=${encodeURIComponent(query)}`}
                    className="btn btn-outline-primary"
                  >
                    Explore related courses
                    <ArrowUpRight size={17} />
                  </Link>
                </div>
              </article>
            ),
          )}
        </div>
      </section>
      <section className="editorial-band">
        <div className="container editorial-grid">
          <div>
            <span className="eyebrow">MAKE THE PATH YOURS</span>
            <h2>
              One direction.
              <br />
              Room to explore.
            </h2>
            <p>
              You do not have to finish everything at once. Pick a course that
              fits your starting point and give yourself a small goal for each
              session.
            </p>
            <Link className="btn btn-white" to="/study-guide">
              Build a study routine
              <ArrowRight size={18} />
            </Link>
          </div>
          <div className="editorial-list">
            {[
              {
                icon: Target,
                title: "Start with a useful goal",
                text: "Choose something you want to build or understand. Let that guide your first course.",
              },
              {
                icon: MonitorPlay,
                title: "Follow the lesson order",
                text: "Use the course outline, watch the lesson, and pause when you need time to practice.",
              },
              {
                icon: CheckCircle2,
                title: "Keep a record of progress",
                text: "Mark a lesson complete after reviewing it. Your dashboard keeps your place.",
              },
            ].map(({ icon: Icon, title, text }) => (
              <article key={title}>
                <Icon size={25} />
                <div>
                  <h3>{title}</h3>
                  <p>{text}</p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>
      <PageInvitation
        title="Your first lesson is a good start."
        description="Browse the catalog and find the right level for you."
        to="/courses"
        label="Explore all courses"
      />
    </>
  );
}

export function Teach() {
  const { user } = useAuth();
  return (
    <>
      <PageHero
        eyebrow="TEACH ON LEARNHUB"
        title={
          <>
            Share what you know.
            <br />
            Give someone a way forward.
          </>
        }
        description="Organize a useful course, explain one idea at a time, and create a learning experience worth coming back to."
      />
      <section className="container section-space">
        <div className="row align-items-center g-5">
          <div className="col-lg-6">
            <span className="eyebrow">A WORKSPACE FOR YOUR KNOWLEDGE</span>
            <h2 className="display-heading">
              Clear lessons.
              <br />
              Thoughtfully put together.
            </h2>
            <p>
              Your teaching workspace brings course details, lesson videos,
              notes, and PDF resources together. You choose the topic, the
              order, and the examples that help students understand.
            </p>
            <div className="teaching-checklist">
              {[
                "Create a course with a title, description, and cover icon.",
                "Add YouTube video links and useful lesson notes.",
                "Attach optional PDFs and keep lessons in order.",
                "Update your own courses as your material develops.",
              ].map((text) => (
                <p key={text}>
                  <Check size={18} />
                  {text}
                </p>
              ))}
            </div>
            <Link
              to={user ? dashboardFor(user) : "/register?role=instructor"}
              className="btn btn-primary"
            >
              {user ? "Open my workspace" : "Apply to teach"}
              <ArrowUpRight size={18} />
            </Link>
          </div>
          <div className="col-lg-6">
            <img
              className="story-image"
              src="/images/learning-studio.svg"
              alt="A teaching workspace with a video lesson and an organized course outline"
              width="800"
              height="640"
              loading="lazy"
            />
          </div>
        </div>
      </section>
      <section className="steps-section">
        <div className="container">
          <div className="section-heading">
            <div>
              <span className="eyebrow">FROM APPLICATION TO FIRST COURSE</span>
              <h2>A considered start to teaching.</h2>
            </div>
          </div>
          <div className="steps-grid">
            {[
              {
                icon: UserRoundPlus,
                title: "Create your teacher account",
                text: "Choose Teacher on the registration form. Use your real name and an email address you can access.",
              },
              {
                icon: ShieldCheck,
                title: "Wait for admin approval",
                text: "Your application appears in the administrator’s review queue. You can sign in as a teacher once it is approved.",
              },
              {
                icon: Presentation,
                title: "Build your first course",
                text: "Open your workspace, add the course details, and organize a useful sequence of video lessons.",
              },
            ].map(({ icon: Icon, title, text }, index) => (
              <article className="step-card" key={title}>
                <span className="step-number">0{index + 1}</span>
                <Icon size={27} className="mb-3" />
                <h3>{title}</h3>
                <p>{text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>
      <section className="container section-space">
        <div className="row g-5">
          <div className="col-lg-4">
            <span className="eyebrow">A COURSE STUDENTS CAN FOLLOW</span>
            <h2>Make the next step clear.</h2>
            <p>
              A good course does not need to be complicated. A clear outcome and
              a consistent lesson structure go a long way.
            </p>
          </div>
          <div className="col-lg-8">
            <div className="quality-grid">
              {[
                {
                  icon: Target,
                  title: "Describe the outcome",
                  text: "Tell students what they can practice, what they should already know, and where to begin.",
                },
                {
                  icon: ListChecks,
                  title: "Give lessons an order",
                  text: "Start with foundations, build on earlier ideas, and use clear titles for every lesson.",
                },
                {
                  icon: FileText,
                  title: "Add useful context",
                  text: "Use short notes, examples, or a small PDF when they help students put a video into practice.",
                },
                {
                  icon: BookOpen,
                  title: "Credit original creators",
                  text: "Use your own material or authorized public videos. Keep source names and links visible.",
                },
              ].map(({ icon: Icon, title, text }) => (
                <article key={title}>
                  <Icon size={26} />
                  <h3>{title}</h3>
                  <p>{text}</p>
                </article>
              ))}
            </div>
          </div>
        </div>
      </section>
      <section className="container">
        <div className="help-callout">
          <ShieldCheck size={28} />
          <div>
            <h3>Already applied?</h3>
            <p>
              Your account stays pending until an admin reviews it. If you need
              help with your application, include your registered email when
              contacting us.
            </p>
          </div>
          <Link to="/contact" className="btn btn-outline-primary">
            Contact us
          </Link>
        </div>
      </section>
      <PageInvitation
        title="Someone can learn from your experience."
        description="Start with a focused topic and one useful lesson."
        to={user ? dashboardFor(user) : "/register?role=instructor"}
        label={user ? "Open my workspace" : "Apply to teach"}
      />
    </>
  );
}

export function StudyGuide() {
  const [minutes, setMinutes] = useState(30);
  const routines = {
    15: [3, 7, 4, 1],
    30: [5, 10, 12, 3],
    60: [10, 20, 25, 5],
  };
  const routine = routines[minutes];
  const activities = [
    {
      title: "Recall",
      text: "Look at your last lesson and write down one thing you remember.",
      icon: BookOpen,
    },
    {
      title: "Watch",
      text: "Focus on one useful idea. Pause when you want to try it yourself.",
      icon: MonitorPlay,
    },
    {
      title: "Practice",
      text: "Change an example, solve a small problem, or explain the idea in your own words.",
      icon: NotebookPen,
    },
    {
      title: "Reflect",
      text: "Write a short note and choose where you will continue next time.",
      icon: CheckCircle2,
    },
  ];
  return (
    <>
      <PageHero
        eyebrow="STUDY GUIDE"
        title={
          <>
            A little structure.
            <br />
            More from every lesson.
          </>
        }
        description="Give your learning a rhythm: a clear goal, focused practice, and a useful next step."
      />
      <section className="container section-space">
        <div className="section-heading">
          <div>
            <span className="eyebrow">PLAN A SESSION</span>
            <h2>How much time do you have?</h2>
            <p>A suggested routine you can adapt to your day.</p>
          </div>
          <div
            className="filter-tabs routine-options"
            role="group"
            aria-label="Study session length"
          >
            {[15, 30, 60].map((value) => (
              <button
                key={value}
                className={minutes === value ? "active" : ""}
                aria-pressed={minutes === value}
                onClick={() => setMinutes(value)}
              >
                {value} minutes
              </button>
            ))}
          </div>
        </div>
        <div className="routine-grid" aria-live="polite">
          {activities.map(({ title, text, icon: Icon }, index) => (
            <article className="routine-card" key={title}>
              <div>
                <Icon size={25} />
                <span>
                  <Clock3 size={14} />
                  {routine[index]} min
                </span>
              </div>
              <h3>{title}</h3>
              <p>{text}</p>
            </article>
          ))}
        </div>
        <p className="form-text mt-3">
          This planner is a suggestion. It does not change your course progress
          or save a schedule.
        </p>
      </section>
      <section className="editorial-band">
        <div className="container editorial-grid">
          <div>
            <span className="eyebrow">MAKE IT PRACTICAL</span>
            <h2>
              Close the video.
              <br />
              Try the idea.
            </h2>
            <p>
              Give yourself a small task after a lesson. It is a useful way to
              notice what you understand and what needs another look.
            </p>
            <Link to="/learning-paths" className="btn btn-white">
              Find a learning path
              <ArrowRight size={18} />
            </Link>
          </div>
          <div className="practice-note">
            <span className="eyebrow">YOUR NOTES CAN BE THIS SIMPLE</span>
            <h3>Today’s learning note</h3>
            <ul>
              <li>
                <strong>I learned:</strong> the idea I want to remember.
              </li>
              <li>
                <strong>I tried:</strong> the example I built or changed.
              </li>
              <li>
                <strong>I need to revisit:</strong> the part that is still
                unclear.
              </li>
              <li>
                <strong>Next time:</strong> one small, specific task.
              </li>
            </ul>
            <NotebookPen size={34} strokeWidth={1.4} />
          </div>
        </div>
      </section>
      <section className="container section-space">
        <div className="section-heading">
          <div>
            <span className="eyebrow">WHEN LEARNING GETS MESSY</span>
            <h2>A few useful ways to keep going.</h2>
          </div>
        </div>
        <div className="steps-grid">
          {[
            {
              title: "When a lesson feels difficult",
              text: "Pause and return to the earlier example. Break the task into smaller steps, then replay only the part you need.",
            },
            {
              title: "When an example does not work",
              text: "Read the error, check what changed, and compare one section at a time. Course software versions may differ from yours.",
            },
            {
              title: "When your time is limited",
              text: "Finish one small activity. Save a note about where you stopped so your next session has an easy starting point.",
            },
          ].map(({ title, text }) => (
            <article className="step-card" key={title}>
              <Lightbulb size={26} className="mb-3" />
              <h3>{title}</h3>
              <p>{text}</p>
            </article>
          ))}
        </div>
      </section>
      <PageInvitation
        title="Put your next idea into practice."
        description="Pick a course, choose a lesson, and make time for one useful step."
        to="/courses"
        label="Find a course"
      />
    </>
  );
}
