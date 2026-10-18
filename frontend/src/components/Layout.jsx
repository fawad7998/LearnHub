import { useState } from "react";
import ThemeToggle from "./ThemeToggle";
import {
  Link,
  NavLink,
  Outlet,
  useLocation,
  useNavigate,
} from "react-router-dom";
import { Dropdown, Offcanvas } from "react-bootstrap";
import {
  Menu,
  Mail,
  ArrowUpRight,
  LayoutDashboard,
  LibraryBig,
  Users,
  LogOut,
  BookOpen,
  Compass,
  ShieldCheck,
} from "lucide-react";
import { useAuth, dashboardFor } from "../context/AuthContext";
import { Avatar, Brand } from "./Shared";
const publicLinks = [
  ["/", "Home"],
  ["/courses", "Courses"],
  ["/learning-paths", "Learning paths"],
  ["/teach", "Teach"],
];
const resourceLinks = [
  ["/about", "About LearnHub"],
  ["/how-it-works", "How it works"],
  ["/study-guide", "Study guide"],
  ["/help", "Help center"],
  ["/contact", "Contact us"],
];
export function PublicLayout() {
  const [menu, setMenu] = useState(false);
  const { user } = useAuth();
  return (
    <>
      <a className="skip-link" href="#main">
        Skip to content
      </a>
      <header className="site-header">
        <div className="container header-inner">
          <Brand />
          <nav className="desktop-nav" aria-label="Main navigation">
            {publicLinks.map(([to, label]) => (
              <NavLink key={to} to={to} end={to === "/"}>
                {label}
              </NavLink>
            ))}
            <Dropdown>
              <Dropdown.Toggle
                variant="link"
                id="resources-navigation"
                className="nav-resources-toggle"
              >
                Resources
              </Dropdown.Toggle>
              <Dropdown.Menu>
                {resourceLinks.map(([to, label]) => (
                  <Dropdown.Item as={NavLink} key={to} to={to}>
                    {label}
                  </Dropdown.Item>
                ))}
              </Dropdown.Menu>
            </Dropdown>
          </nav>
          <div className="header-actions">
            <ThemeToggle />
            {user ? (
              <Link className="account-link" to={dashboardFor(user)}>
                <Avatar name={user.name} />
                <span>{user.name.split(" ")[0]}</span>
              </Link>
            ) : (
              <>
                <Link to="/login" className="login-link">
                  Log in
                </Link>
                <Link to="/register" className="btn btn-primary">
                  Start learning
                </Link>
              </>
            )}
            <button
              className="icon-button mobile-menu"
              aria-label="Open navigation"
              onClick={() => setMenu(true)}
            >
              <Menu />
            </button>
          </div>
        </div>
      </header>
      <Offcanvas show={menu} onHide={() => setMenu(false)} placement="end">
        <Offcanvas.Header closeButton>
          <Offcanvas.Title>Explore LearnHub</Offcanvas.Title>
        </Offcanvas.Header>
        <Offcanvas.Body>
          <nav className="mobile-nav" onClick={() => setMenu(false)}>
            {[...publicLinks, ...resourceLinks].map(([to, label]) => (
              <NavLink key={to} to={to} end={to === "/"}>
                {label}
              </NavLink>
            ))}
            <NavLink to={dashboardFor(user)}>
              {user ? "My dashboard" : "Log in"}
            </NavLink>
            {!user && (
              <Link to="/register" className="btn btn-primary">
                Start learning
              </Link>
            )}
          </nav>
        </Offcanvas.Body>
      </Offcanvas>
      <main id="main">
        <Outlet />
      </main>
      <footer className="site-footer">
        <div className="container footer-grid">
          <div className="footer-brand">
            <Brand />
            <p>
              A little progress.
              <br />A new possibility.
            </p>
            <span>Build a skill. Share what you know.</span>
          </div>
          <div>
            <h2>Explore</h2>
            <Link to="/courses">All courses</Link>
            <Link to="/learning-paths">Learning paths</Link>
            <Link to="/study-guide">Study guide</Link>
            <Link to="/how-it-works">How it works</Link>
            <Link to="/teach">Teach on LearnHub</Link>
          </div>
          <div>
            <h2>LearnHub</h2>
            <Link to="/about">About us</Link>
            <Link to="/contact">Contact us</Link>
            <Link to="/help">Help center</Link>
          </div>
          <div>
            <h2>Your next chapter</h2>
            <p>Your curiosity deserves a place to grow.</p>
            <Link className="text-link" to={dashboardFor(user)}>
              {user ? "My dashboard" : "Start learning"}
              <ArrowUpRight size={17} />
            </Link>
          </div>
        </div>
        <div className="container footer-bottom">
          <span>© {new Date().getFullYear()} LearnHub</span>
          <span>
            Independent learning platform · Videos credited to their creators
          </span>
        </div>
      </footer>
    </>
  );
}
export function DashboardLayout() {
  const { user, signOut } = useAuth();
  const [menu, setMenu] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const base = dashboardFor(user);
  const isStudent = user.role === "student";
  const items = [
    {
      to: base,
      name: "Overview",
      icon: LayoutDashboard,
      end: true,
    },
    {
      to: `${base}/courses`,
      name: isStudent
        ? "My learning"
        : user.role === "admin"
          ? "All courses"
          : "My courses",
      icon: LibraryBig,
    },
  ];
  if (user.role === "admin")
    items.push(
      {
        to: `${base}/users`,
        name: "Manage users",
        icon: Users,
      },
      {
        to: `${base}/teachers`,
        name: "Teacher approvals",
        icon: ShieldCheck,
      },
      {
        to: `${base}/messages`,
        name: "Inbox",
        icon: Mail,
      },
    );
  async function logout() {
    try {
      await signOut();
    } catch {}
    navigate("/login");
  }
  const sidebar = (
    <>
      <div className="sidebar-brand">
        <Brand />
      </div>
      <span className="sidebar-label">YOUR WORKSPACE</span>
      <nav className="workspace-nav" aria-label="Dashboard navigation">
        {items.map(({ to, name, icon: Icon, end }) => (
          <NavLink key={to} to={to} end={end} onClick={() => setMenu(false)}>
            <Icon size={20} />
            {name}
          </NavLink>
        ))}
        <Link to="/courses">
          <Compass size={20} />
          Explore courses
        </Link>
      </nav>
      <div className="sidebar-note">
        <BookOpen size={24} />
        <strong>
          {isStudent ? "Keep your curiosity." : "Make learning happen."}
        </strong>
        <p>
          {isStudent
            ? "Every lesson is a step toward something new."
            : "A clear lesson can open up a whole new world."}
        </p>
      </div>
      <div className="sidebar-account">
        <Avatar name={user.name} />
        <div>
          <strong>{user.name}</strong>
          <span>{user.role === "instructor" ? "Teacher" : user.role}</span>
        </div>
        <button className="icon-button" aria-label="Sign out" onClick={logout}>
          <LogOut size={18} />
        </button>
      </div>
    </>
  );
  return (
    <div className="workspace">
      <a className="skip-link" href="#main">
        Skip to content
      </a>
      <aside className="sidebar">{sidebar}</aside>
      <Offcanvas
        show={menu}
        onHide={() => setMenu(false)}
        className="workspace-offcanvas"
      >
        <Offcanvas.Header closeButton>
          <Offcanvas.Title>Workspace</Offcanvas.Title>
        </Offcanvas.Header>
        <Offcanvas.Body>{sidebar}</Offcanvas.Body>
      </Offcanvas>
      <div className="workspace-content">
        <header className="workspace-topbar">
          <button
            className="icon-button mobile-menu"
            aria-label="Open dashboard navigation"
            onClick={() => setMenu(true)}
          >
            <Menu />
          </button>
          <span className="workspace-breadcrumb">
            Workspace <span>/</span>{" "}
            {items
              .slice()
              .reverse()
              .find((item) => location.pathname.startsWith(item.to))?.name ||
              "Course editor"}
          </span>
          <div className="topbar-actions">
            <ThemeToggle />
            <span className="role-pill">
              {user.role === "instructor" ? "Teacher" : user.role} space
            </span>
          </div>
        </header>
        <main id="main" className="workspace-main">
          {location.pathname === base && (
            <div className="workspace-welcome">
              <div>
                <span className="eyebrow">LEARNHUB / YOUR SPACE TO GROW</span>
                <h2>
                  {isStudent
                    ? "Small steps. Real progress."
                    : user.role === "admin"
                      ? "A clear view of your community."
                      : "Your knowledge. Their next possibility."}
                </h2>
                <p>
                  {isStudent
                    ? "Make time for one useful idea today."
                    : user.role === "admin"
                      ? "Keep courses, people and conversations moving."
                      : "Create a learning path that someone will be glad they found."}
                </p>
              </div>
              <span className="workspace-welcome-icon">
                <BookOpen size={68} strokeWidth={1} />
              </span>
            </div>
          )}
          <Outlet />
        </main>
        <footer className="workspace-footer">
          Made for your next chapter. <span>LearnHub</span>
        </footer>
      </div>
    </div>
  );
}
