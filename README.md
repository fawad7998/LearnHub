# LearnHub — MERN Stack Learning Management System

**Final Project:** Hunarmand Punjab — MERN Stack Web Development, Batch 3  
**Live application:** https://learnhub-frontend-alpha.vercel.app/  
**GitHub repository:** https://github.com/fawad7998/LearnHub

## Overview

LearnHub is a full-stack Learning Management System built with the MERN stack. Students can explore courses, enroll, watch lessons and track learning progress. Instructors can manage courses and lessons, while administrators manage users, instructor approvals and platform content. The application includes role-based authentication and a responsive React interface.

## Technologies

- **Frontend:** React 19, Vite 7, React Router 7, Axios, Bootstrap, React Bootstrap, CSS
- **Backend:** Node.js (22.12+), Express 5, REST APIs
- **Database:** MongoDB, Mongoose 9
- **Authentication and security:** JWT, bcrypt, role-based middleware, Helmet, rate limiting, Zod validation
- **Additional:** Nodemailer, Multer, Lucide React

## Main features

- Public home page, course catalog, course details, registration and login
- Three roles: **Admin**, **Instructor/Teacher**, **Student**
- Protected dashboards and backend API endpoints
- Course creation, listing, editing and deletion by authorized roles
- Instructor approval and lesson management
- Student enrollment, learning progress and video lessons
- Password recovery, contact messages, responsive layouts and light/dark theme

## Project structure

```text
LearnHub/
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   ├── config/
│   │   ├── context/
│   │   ├── pages/
│   │   ├── routes/
│   │   └── services/
│   ├── package.json
│   └── README.md
├── backend/
│   ├── config/
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── app.js
│   ├── package.json
│   └── README.md
└── README.md
```

## Requirements

- Node.js **22.12.0 or newer** and npm
- A MongoDB database (local or hosted)
- Environment variables configured separately for frontend and backend

## Local installation

1. Download or clone the repository, then open two terminals in the project root.
2. Configure `backend/.env` using `backend/.env.example`, including the MongoDB connection and JWT secret. Configure `frontend/.env` using `frontend/.env.example`, including `VITE_API_URL` pointing to the backend.
3. In the backend terminal:

   ```bash
   cd backend
   npm install
   npm run dev
   ```

4. In the frontend terminal:

   ```bash
   cd frontend
   npm install
   npm run dev
   ```

5. Open the local URL printed by Vite (typically `http://localhost:5173`). The backend normally runs at `http://localhost:5000` when configured accordingly.

**For a brand-new empty database only:** consult `backend/README.md` and run `npm run setup` once to create sample courses and initial accounts. **Never rerun setup on an existing database without checking its effects.** Do not publish generated account passwords.

## API overview

The backend exposes REST endpoints for registration, login, courses, lesson management, enrollment, and administration. Core routes include:

| Method | Route | Purpose |
| --- | --- | --- |
| POST | `/register` | Register a user |
| POST | `/login` | Authenticate and receive session credentials |
| GET | `/courses` | List courses |
| GET | `/courses/:id` | View course details |
| POST | `/courses` | Create a course (authorized roles) |
| PUT | `/courses/:id` | Update a course (authorized roles) |
| DELETE | `/courses/:id` | Delete a course (authorized roles) |
| POST | `/enroll` | Enroll as a student |
| GET | `/my-courses` | Retrieve enrolled courses |

See `backend/routes/index.js` for the complete route definitions. Depending on backend mounting configuration, requests may require an API base prefix; use the base URL configured in `frontend/src/services/api.js`.

## Testing and submission evidence

The accompanying PDF report should document both assignment questions with screenshots of key pages, project structure, code, server logs, Postman API responses, role-based access, enrollment, and live deployment. Screenshots and test outcomes should be captured from actual working runs rather than simulated responses.

## Deployment

- **Frontend:** https://learnhub-frontend-alpha.vercel.app/
- **Backend/API:** https://learn-hub-sooty.vercel.app/
- **GitHub:** [ADD YOUR REPOSITORY URL]
