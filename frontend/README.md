# LearnHub frontend

React, React Router, Axios, Bootstrap, Lucide icons and custom CSS.
Use Node.js 22.12 or newer. Install separately from the backend.

## Start

Your existing frontend `.env` is retained. In a second terminal:

```bash
cd frontend
npm install
npm run dev
```

Open `http://localhost:5173`. Start the backend first; run its one-time setup only
for a new empty installation. Already imported your data? Keep it and skip setup.
See `backend/UPDATE_GUIDE.md` for this update. The frontend uses `VITE_API_URL` from `.env`, normally
`http://localhost:5000`. Restart Vite after changing it. For a new installation
without `.env`, copy `.env.example` first. Never put database or JWT secrets here.

## Try the app

1. Open `backend/account-access.txt` after successful setup to find new Admin and
   Teacher login passwords. Log in to review the imported courses.
2. Sign out. Register a new **Student**, then log in and enroll in a free course.
3. Watch a lesson, mark it complete and check your dashboard progress.
4. Sign out. Register a different real email as a **Teacher**. Admin must approve
   this account from **Teacher approvals** before the teacher can log in.
5. Sign in as the approved teacher, create a course, and add video lessons.
6. Send a message through Contact. Log in as Admin and open Inbox to review it.

No Student or enrollment records are created by setup. Real users and course data
come from the configured MongoDB database. Admin registration is not public.

## Pages and features

- Home, catalog, course details, Learning Paths, Teach, Study Guide, About,
  Contact, How It Works and Help, with expanded content and Resources navigation.
- Forgot Password with email, PIN verification, and new password steps.
- Admin teacher approval queue, review actions, and pending count on the overview.
- Separate Student, Teacher and Admin workspaces with server-enforced permissions.
- 24 selectable cover icons and the actual course title on each cover.
- Video viewer with the official YouTube player, course navigation and progress.
- Optional lesson notes, PDF resources and automatic YouTube playlist import.
- Searchable lesson lists and teacher courses; searchable help questions.
- Page loading, course skeletons, request progress and busy form controls.
- Responsive navigation, mobile course list, keyboard-accessible forms and themes.

The theme button switches light/dark mode. The initial theme follows your device,
and your choice persists in local storage. Login tokens use session storage.
The included illustrations are original SVG assets, stored in `public/images`.

## Code layout

- `src/App.jsx`: page routes and lazy loading.
- `src/pages/`: public pages, dashboards, course/lesson editors and learner view.
- `src/components/`: layouts, cards, loading UI, theme toggle and video player.
- `src/context/`: authentication and theme state.
- `src/config/`: course icon/category choices and help content.
- `src/services/api.js`: Axios, auth headers and request loading state.
- `src/styles.css`: shared component styles and theme colors.
- `src/enhancements.css`: new public pages, video, editors and responsive styles.
- `src/pages.css`: learning paths, study planner, recovery and approval screens.

## Build and Vercel

```bash
npm run build
```

This creates `dist`. `npm run preview` previews it locally on port 4173; include
`http://localhost:4173` in the backend's `CLIENT_URL` if using that preview.

For deployment, create a separate Vercel project with root `frontend`, preset Vite,
build command `npm run build`, and output directory `dist`. Set `VITE_API_URL` to
your backend's HTTPS origin **without `/api`**. Set the backend's `CLIENT_URL` to
the exact frontend HTTPS origin. Redeploy after changing `VITE_API_URL`.
`vercel.json` supports React Router page refreshes. Keep environment files out of
GitHub; enter deployment secrets in Vercel's environment settings instead.
