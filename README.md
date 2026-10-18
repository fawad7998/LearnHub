# LearnHub — MERN Learning Management System

**Student:** Fawad Ahmad  
**Project:** Hunarmand Punjab — MERN Stack, Batch 3  
**Live:** https://learnhub-frontend-alpha.vercel.app/  
**GitHub:** https://github.com/fawad7998/LearnHub  
**Backend:** https://learn-hub-sooty.vercel.app/

## About

LearnHub is a MERN learning platform where students browse courses, enroll, watch lessons and track progress. Teachers create courses and lessons; admins manage users and approvals. It supports JWT login and role-based dashboards.

**Stack:** React, Vite, Axios, Node.js, Express, MongoDB, Mongoose, JWT and bcrypt.

## Run locally

**Requirements:** Node.js 22.12+, npm, MongoDB.

1. Clone/download the project. Create `backend/.env` and `frontend/.env` from their respective `.env.example` files. Set the MongoDB connection string and JWT secret in the backend, and `VITE_API_URL` to your backend address in the frontend.
2. Start the backend:
   ```bash
   cd backend
   npm install
   npm run dev
   ```
3. In another terminal, start the frontend:
   ```bash
   cd frontend
   npm install
   npm run dev
   ```
4. Open the local URL shown by Vite (usually `http://localhost:5173`).

## Import sample database (MongoDB Compass)

For a **new, empty database**, extract `LearnHub_Compass_Import.rar`, connect MongoDB Compass to the database specified in `backend/.env`, and import each JSON file using **Add Data → Import JSON or CSV**:

| Order | JSON file | Collection |
|---|---|---|
| 1 | `01_users.json` | `users` |
| 2 | `02_courses.json` | `courses` |
| 3 | `03_lessons.json` | `lessons` |
| 4 | `04_enrollments.json` | `enrollments` |

Create each collection if necessary. Verify all four contain records, then restart the app. **Do not run `npm run setup` after importing**, since it may create duplicate sample data.

**Demo logins:** See `LearnHub_All_User_Accounts.txt` for each account's **email, password and role** (Admin, Teacher, Student). Use these to log in after import. **Keep this file private; do not commit it or `.env` files to a public repository.**

## Main features

- Registration/login and protected Admin, Teacher and Student dashboards
- Course listing, search and course management (create/edit/delete)
- Video lessons, PDF resources, enrollment and progress tracking
- Admin user management and teacher approvals

## API examples

`POST /register` · `POST /login` · `GET /courses` · `POST /courses` · `PUT /courses/:id` · `DELETE /courses/:id` · `POST /enroll` · `GET /my-courses`

For additional configuration and routes, see `backend/README.md` and `frontend/README.md`.
