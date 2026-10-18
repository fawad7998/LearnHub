import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowUpRight,
  ArrowRight,
  PlayCircle,
  BookmarkCheck,
  Compass,
  MonitorPlay,
  ListChecks,
  GraduationCap,
  Presentation,
  Check,
  Code2,
  BrainCircuit,
  Palette,
  Gamepad2,
} from "lucide-react";
import api, { errorMessage } from "../services/api";
import { useAuth, dashboardFor } from "../context/AuthContext";
import {
  CourseCard,
  CourseSkeleton,
  ErrorBox,
  EmptyState,
} from "../components/Shared";
import { faqs } from "../config/faqs";
import { learningPaths } from "../config/learningPaths";

export default function Home() {
  const { user } = useAuth();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  function load() {
    setLoading(true);
    setError("");
    api
      .get("/courses")
      .then(({ data }) => setCourses(data.courses))
      .catch((e) => setError(errorMessage(e)))
      .finally(() => setLoading(false));
  }
  useEffect(load, []);
  return (
    <>
      <section className="home-hero">
        <div className="container">
          <div className="row align-items-center g-5">
            <div className="col-lg-6">
              <span className="eyebrow hero-eyebrow">
                <span /> A NEW SKILL. A NEW POSSIBILITY.
              </span>
              <h1>
                Make room for
                <br />
                your <span>next big idea.</span>
              </h1>
              <p className="hero-description">
                From your first line of code to your next creative project. Find
                a course, follow a clear path, and make a little progress every
                day.
              </p>
              <div className="hero-buttons">
                <Link to="/courses" className="btn btn-primary btn-lg">
                  Explore courses <ArrowUpRight size={20} />
                </Link>
                <Link to="/how-it-works" className="hero-secondary">
                  <PlayCircle size={22} /> How it works
                </Link>
              </div>
              <div className="hero-assurances">
                <span>
                  <Check size={17} />
                  Learn at your pace
                </span>
                <span>
                  <Check size={17} />
                  Keep your progress
                </span>
              </div>
            </div>
            <div className="col-lg-6">
              <div className="hero-art">
                <img
                  src="/images/learning-studio.svg"
                  alt="An illustrated learning workspace with a video lesson, code and progress tracker"
                  width="800"
                  height="640"
                  fetchPriority="high"
                />
                <div className="hero-art-caption">
                  <span>
                    <MonitorPlay size={18} /> A space to learn
                  </span>
                  <strong>A place to grow ↗</strong>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      <section className="value-strip">
        <div className="container value-strip-inner">
          <span>
            <MonitorPlay size={20} />
            Video lessons that make sense
          </span>
          <span>
            <BookmarkCheck size={20} />
            Progress saved as you go
          </span>
          <span>
            <Compass size={20} />
            Your own learning pace
          </span>
        </div>
      </section>
      <section className="section-space">
        <div className="container">
          <div className="section-heading">
            <div>
              <span className="eyebrow">FOLLOW YOUR CURIOSITY</span>
              <h2>A good place to begin.</h2>
              <p>Complete learning paths, one useful lesson at a time.</p>
            </div>
            <Link to="/courses" className="btn btn-outline-primary">
              All courses <ArrowRight size={17} />
            </Link>
          </div>
          <ErrorBox message={error} retry={load} />
          {loading ? (
            <CourseSkeleton />
          ) : courses.length ? (
            <div className="row g-4">
              {courses.slice(0, 3).map((course) => (
                <div className="col-md-6 col-xl-4" key={course._id}>
                  <CourseCard course={course} />
                </div>
              ))}
            </div>
          ) : (
            !error && (
              <EmptyState
                title="The next chapter is being prepared."
                description="Teachers are getting courses ready. Check back soon."
              />
            )
          )}
        </div>
      </section>
      <section className="topic-section">
        <div className="container">
          <div className="section-heading">
            <div>
              <span className="eyebrow">THERE’S MORE TO EXPLORE</span>
              <h2>Where will curiosity take you?</h2>
            </div>
            <p>
              Start with an interest.
              <br />
              Turn it into something you can do.
            </p>
          </div>
          <div className="topic-grid">
            {[
              {
                title: "Development",
                text: "Build for the web",
                icon: Code2,
                color: "blue",
              },
              {
                title: "Artificial intelligence",
                text: "Understand what’s next",
                icon: BrainCircuit,
                color: "purple",
              },
              {
                title: "Design",
                text: "Bring ideas to life",
                icon: Palette,
                color: "orange",
              },
              {
                title: "Gaming",
                text: "Create a new world",
                icon: Gamepad2,
                color: "teal",
              },
            ].map(({ title, text, icon: Icon, color }) => (
              <Link
                className={`topic-card color-${color}`}
                to={`/courses?category=${encodeURIComponent(title)}`}
                key={title}
              >
                <Icon size={30} />
                <strong>{title}</strong>
                <span>{text}</span>
                <ArrowUpRight className="topic-arrow" size={20} />
              </Link>
            ))}
          </div>
        </div>
      </section>
      <section className="section-space">
        <div className="container">
          <div className="row align-items-center g-5">
            <div className="col-lg-6">
              <img
                className="story-image"
                src="/images/learning-path.svg"
                alt="Illustrated learning path connecting a first project, video lesson and completed milestone"
                width="700"
                height="520"
                loading="lazy"
              />
            </div>
            <div className="col-lg-6">
              <span className="eyebrow">
                A LITTLE STRUCTURE. A LOT OF POSSIBILITY.
              </span>
              <h2 className="display-heading">
                Less wondering where.
                <br />
                More knowing how.
              </h2>
              <p>
                Good learning needs a clear next step. Your course keeps the
                lessons in order, your dashboard keeps track of progress, and
                you set the pace.
              </p>
              <div className="feature-stack">
                {[
                  {
                    title: "Watch and understand",
                    text: "Follow video lessons inside a focused learning space.",
                    icon: MonitorPlay,
                  },
                  {
                    title: "Practice what you learn",
                    text: "Pause, try it yourself, and revisit the parts that matter.",
                    icon: ListChecks,
                  },
                  {
                    title: "See your progress",
                    text: "Mark each lesson complete and pick up where you left off.",
                    icon: BookmarkCheck,
                  },
                ].map(({ title, text, icon: Icon }) => (
                  <div key={title}>
                    <span>
                      <Icon size={22} />
                    </span>
                    <div>
                      <h3>{title}</h3>
                      <p>{text}</p>
                    </div>
                  </div>
                ))}
              </div>
              <Link to="/about" className="text-link">
                Get to know LearnHub <ArrowRight size={17} />
              </Link>
            </div>
          </div>
        </div>
      </section>
      <section className="steps-section">
        <div className="container">
          <div className="section-heading">
            <div>
              <span className="eyebrow">FROM CURIOUS TO CONFIDENT</span>
              <h2>Your next chapter, in three steps.</h2>
            </div>
          </div>
          <div className="steps-grid">
            {[
              {
                title: "Find your starting point",
                text: "Browse by topic and choose a course that matches your interests.",
              },
              {
                title: "Make it your own",
                text: "Create a Student account, log in, and enroll in your chosen course.",
              },
              {
                title: "Keep moving forward",
                text: "Watch a lesson, put it into practice, and save your progress.",
              },
            ].map((item, index) => (
              <article className="step-card" key={item.title}>
                <span className="step-number">0{index + 1}</span>
                <h3>{item.title}</h3>
                <p>{item.text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>
      <section className="section-space">
        <div className="container">
          <div className="teacher-invitation">
            <div className="teacher-icon">
              <Presentation size={64} strokeWidth={1.2} />
            </div>
            <div>
              <span className="eyebrow">KNOW SOMETHING WORTH SHARING?</span>
              <h2>
                Someone’s next step
                <br />
                could start with you.
              </h2>
              <p>
                Create a course, give it a personality, and build a learning
                journey with videos, notes and resources.
              </p>
            </div>
            <Link
              className="btn btn-white btn-lg"
              to={user ? dashboardFor(user) : "/teach"}
            >
              {user ? "Open workspace" : "Explore teaching"}
              <ArrowUpRight size={19} />
            </Link>
          </div>
        </div>
      </section>
      <section className="container section-space home-paths">
        <div className="section-heading">
          <div>
            <span className="eyebrow">A DIRECTION TO BUILD ON</span>
            <h2>Find a path that fits your curiosity.</h2>
            <p>Start with a foundation. Give your next project a purpose.</p>
          </div>
          <Link to="/learning-paths" className="btn btn-outline-primary">
            View learning paths
            <ArrowRight size={17} />
          </Link>
        </div>
        <div className="learning-path-grid">
          {learningPaths.map(
            ({ title, description, icon: Icon, query }, index) => (
              <article className="learning-path-card compact-path" key={title}>
                <div className="learning-path-top">
                  <Icon size={35} strokeWidth={1.5} />
                  <span>0{index + 1}</span>
                </div>
                <div className="learning-path-body">
                  <h3>{title}</h3>
                  <p>{description}</p>
                  <Link
                    className="text-link"
                    to={`/courses?q=${encodeURIComponent(query)}`}
                  >
                    Explore courses
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
            <span className="eyebrow">TURN WATCHING INTO DOING</span>
            <h2>
              Your progress starts
              <br />
              with one useful habit.
            </h2>
            <p>
              A lesson is a starting point. Pause to practice, make a small
              change, and keep a note of what you want to try next.
            </p>
            <Link to="/study-guide" className="btn btn-white">
              Open the study guide
              <ArrowRight size={18} />
            </Link>
          </div>
          <div className="editorial-list">
            {[
              {
                icon: MonitorPlay,
                title: "Watch with a question",
                text: "Know what you want to understand before pressing play.",
              },
              {
                icon: Code2,
                title: "Try a small example",
                text: "Put the idea to work while it is still fresh.",
              },
              {
                icon: BookmarkCheck,
                title: "Leave yourself a next step",
                text: "Save your progress and choose where to begin tomorrow.",
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
      <section className="container home-faq">
        <div className="row g-5">
          <div className="col-lg-4">
            <span className="eyebrow">A FEW THINGS TO KNOW</span>
            <h2>
              Curiosity starts
              <br />
              with questions.
            </h2>
            <p>Here are a few answers to get you going.</p>
            <Link to="/help" className="text-link">
              Visit the help center <ArrowRight size={17} />
            </Link>
          </div>
          <div className="col-lg-8">
            <div className="faq-list">
              {faqs.slice(0, 4).map((item) => (
                <details key={item.question}>
                  <summary>{item.question}</summary>
                  <p>{item.answer}</p>
                </details>
              ))}
            </div>
          </div>
        </div>
      </section>
      <section className="container section-space">
        <div className="home-invitation">
          <div>
            <span className="eyebrow">YOUR NEXT CHAPTER IS WAITING</span>
            <h2>Start small. Go somewhere new.</h2>
            <p>One course. One lesson. One step closer.</p>
          </div>
          <Link
            to={user ? dashboardFor(user) : "/register"}
            className="btn btn-primary btn-lg"
          >
            <GraduationCap size={20} />
            {user ? "Go to my dashboard" : "Create your account"}
          </Link>
        </div>
      </section>
    </>
  );
}
