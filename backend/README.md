# LearnHub backend

Express, MongoDB/Mongoose, JWT and Bcrypt. Use Node.js 22.12 or newer.
The project has two independent folders: `frontend` and `backend`.

## Updating an existing installation

Keep your current `.env` and database. Run `npm install` in each folder and start
both apps normally. **Do not rerun setup or import your database again.**
Read [UPDATE_GUIDE.md](UPDATE_GUIDE.md) for the new SMTP settings, password recovery,
teacher approval flow, and theme changes. Nodemailer is now a backend dependency.

## First installation only

Your existing `.env` is retained in this private project copy. Do not overwrite it
with `.env.example`. Keep `.env` and `account-access.txt` out of GitHub and any
public submission. Each folder includes its own `.gitignore`.

**Windows:** extract the entire ZIP, keep your corrected `backend/.env`, then
double-click `backend/SETUP_DATABASE.cmd`. It installs backend dependencies when
missing, runs setup, and keeps the window open so you can read its result. Wait
for **SETUP COMPLETE** before logging in. This is the same setup as the command
below; you do not need to do both.

In a terminal opened in `backend`:

```bash
npm install
npm run setup
npm run dev
```

Run `setup` once before starting the website. It connects to the database in
`MONGODB_URI` and creates:

- Admin: `admin@learnhub.test`
- Teacher: `teacher@learnhub.test` (display name: LearnHub Course Curator)
- Three free courses, with 200 ordered video lessons in total.

New account passwords are generated randomly and saved in
`backend/account-access.txt`. Open that file to get the login credentials.
Passwords are hashed in MongoDB; the access file is only for the project owner.
Existing accounts keep their existing passwords. Setup never creates a Student.
The `.test` addresses are login identifiers, not working email inboxes.

Changing a database name or starting the server does not insert initial records.
The admin role, dashboard and protected management routes are already implemented;
setup creates the actual admin account that can use them. Sign in on the normal
Login page as `admin@learnhub.test`, using its generated password, to open
`/dashboard/admin`. **Manage users** lets you change Student/Teacher roles, pause
or activate accounts, and delete eligible accounts. **All courses** manages the
catalog. Admin is intentionally absent from public registration.

On an empty database, successful setup leaves these counts:

| Collection | Documents |
| ---------- | --------- |
| `users`    | 2         |
| `courses`  | 3         |
| `lessons`  | 200       |

`enrollments`, `messages` and `resources` can still be empty until you use those
features. Setup reads back the course video links and prints the actual collection
counts. Counts can be higher if you already have other records.

If Compass still shows zero after **SETUP COMPLETE**, refresh it and check that
its connection uses the same MongoDB server and database name printed by setup.
A connection label such as "LearningHub" does not identify which server it uses.
If setup fails, share the terminal error, with credentials hidden; the program
does not print the connection string or generated passwords. A DNS lookup error
means the process could not yet reach MongoDB. Keep the entire output because
some records may have been saved before a later error. Rerunning setup adds any
missing initial records without clearing your data.

Setup is safe to repeat: it keeps existing accounts, courses, lessons and student
progress, and skips the imported courses/links already present. It does not erase
an existing database. If an old sample student remains in your existing database,
remove it using Admin > Manage users. Delete unwanted old courses through Admin >
All courses. A teacher must have no courses before that account can be deleted.

The delivered code was prepared with your configuration. The remote Atlas SRV
lookup was blocked in the editing environment, so **your remote database has not
been populated or reset here**. Run the setup command from your own computer with
working Atlas connectivity. If it fails, check the URI, database user credentials,
Atlas Network Access, and your DNS/network. The app never substitutes a temporary
or local-file database.

`npm start` runs without automatic restarts. `GET /health` checks database readiness.
Local startup reports the connected database and warns when no active admin exists.
The backend will not start without valid configuration and a working database.

## Environment

For a new installation only, copy `.env.example` to `.env` and set:

| Key               | Purpose                                                   |
| ----------------- | --------------------------------------------------------- |
| `MONGODB_URI`     | Your MongoDB connection string, including a database name |
| `JWT_SECRET`      | A random secret of at least 32 characters                 |
| `PORT`            | Local API port; default `5000`                            |
| `CLIENT_URL`      | Allowed frontend origin; default `http://localhost:5173`  |
| `YOUTUBE_API_KEY` | Optional; automatic import of additional playlists only   |
| `SMTP_HOST`       | Mail provider hostname; required for password recovery    |
| `SMTP_PORT`       | `587` for STARTTLS or `465` for TLS                       |
| `SMTP_USER`       | SMTP username or sender email                             |
| `SMTP_PASS`       | SMTP password or provider App Password                    |
| `SMTP_FROM`       | Optional approved sender; defaults to SMTP_USER           |

Only MongoDB and JWT are required for the normal local setup. Keep your existing
PORT/CLIENT_URL values when they match your local frontend. Generate a JWT secret
if needed with `node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"`.
A JWT secret is a server signing secret, not a user login token.

No Blob token, storage driver or seed password is used. PDFs are stored in MongoDB.

## How accounts work

1. A visitor chooses **Student** or **Teacher** on the registration page.
2. Registration saves the account to MongoDB, then redirects to Login.
3. Students can log in immediately. New teachers need Admin approval first.
4. Students enroll in courses and mark lessons complete.
5. Teachers create and manage their own courses and lessons.
6. Admin reviews Teacher approvals and manages users, courses, analytics and inbox.

Existing teachers without an approval field remain approved. New teacher
registrations explicitly start pending. Email PIN password recovery is available
for active real-email accounts after SMTP setup. Demo accounts retain their
passwords. PINs are stored as keyed hashes, with expiry and attempt limits;
single-use reset tokens are stored as hashes. Successful recovery revokes existing
sessions. Recovery never changes an account's role or approval status.

`instructor` is the internal database/API role name for Teacher. Public registration
accepts only `student` or `instructor`; it cannot create an admin. Authorization and
course ownership are enforced by the backend on every protected endpoint.

## Initial video catalog

Playlist titles and links were checked on 12 October 2026. The catalog contains
metadata and public links, not downloaded videos. The app reads courses and lessons
from MongoDB; `catalog/initial-courses.json` is used only by the one-time setup.

| Course                                    | Original creator    | Videos |
| ----------------------------------------- | ------------------- | ------ |
| React: from components to complete apps   | CodeWithHarry       | 78     |
| JavaScript: the complete learning journey | CodeWithHarry       | 103    |
| Generative AI for beginners               | Microsoft Developer | 19     |

Sources:

- React: https://www.youtube.com/playlist?list=PLu0W_9lII9agx66oZnT6IyhcMIbUMNMdt
- JavaScript: https://www.youtube.com/playlist?list=PLu0W_9lII9ahR1blWXxgSlL4y9iQBnLpR
- AI: https://www.youtube.com/playlist?list=PLlrxD0HtieHj2nfK54c62lcs3-YSTx3Je

The AI playlist includes 18 individual lessons plus its full-series compilation.
The React series uses the creator's original tooling; some installation commands
and library versions differ from current tools. Creators can change availability,
embedding permissions or playlist contents after this snapshot.

The curator account organizes the catalog. Original creators are identified
separately on the course and video pages. LearnHub is not affiliated with them.

## Add your own courses

Register a new Teacher account through the website, wait for Admin approval, log
in, then select Create course. Choose from 24 icons, enter the details, and optionally add an introductory
YouTube video, playlist link and original creator name. The title appears on the
selected cover. Save the course to open the lesson editor.

A video lesson needs only a title and an individual YouTube video link. Order is
automatic. Notes, order changes and PDF resources are inside the optional section.
Reading-only lessons remain supported: leave the video empty and add 20 or more
characters of notes. PDFs have a 2 MB limit and protected downloads.

YouTube watch URLs cannot be used as standalone HTML video files. The LearnHub
viewer uses the official embedded player with lesson navigation, progress,
loading feedback and source links around it. YouTube controls and branding remain.
No videos are downloaded or rehosted. If a creator blocks embedding, the viewer
provides a Watch on YouTube link.

## Import another whole playlist (optional)

The three initial courses and manually added video lessons need no YouTube API key.
To enable automatic playlist import for additional courses:

1. In Google Cloud, enable **YouTube Data API v3** for a project and create an API key.
2. Restrict the key to YouTube Data API v3 and set `YOUTUBE_API_KEY` on the backend.
3. Restart the backend. Open a course's lesson editor and expand Import a YouTube playlist.
4. Paste a public playlist link and import. The server follows pagination, preserves
   playlist order, skips unavailable videos and skips videos already linked in that course.

The importer supports up to 1,000 playlist entries and appends to existing lessons.
YouTube API quotas apply. Never put this key in the frontend.

API reference: https://developers.google.com/youtube/v3/docs/playlistItems/list
Player reference: https://developers.google.com/youtube/iframe_api_reference

## Code layout

- `app.js`: environment, MongoDB connection, middleware, route registration and server.
- `routes/index.js`: API endpoints and permission middleware.
- `controllers/`: request handling and database queries.
- `models/`: User, Course, Lesson, Enrollment, Resource and Message schemas.
- `middleware/`: authentication, role checks, validation and errors.
- `services/`: MongoDB PDFs, YouTube helpers, SMTP email and account rules.
- `config/`: allowed course categories and cover IDs.
- `setup.js` and `catalog/`: one-time account and course provisioning, never app startup.
- `SETUP_DATABASE.cmd`: Windows launcher for the same one-time setup.

Database relationships: a Course references its teacher User; a Lesson references
its Course; an Enrollment references its Student, Course and completed Lessons.
A lesson's Resource is a separate MongoDB record. Contact Messages are visible only
to Admin. No passwords are returned by the API. Logout, suspension and role changes
invalidate existing sessions; password recovery does too. Login sessions expire after 8 hours.

## Deploy on Vercel

Create two Vercel projects from the same repository. For the backend, choose the
`backend` root and the Express preset. `app.js` exports the app; no custom output
directory or build command is needed. Set `MONGODB_URI`, `JWT_SECRET`, and `CLIENT_URL`
in the backend project's environment. Set the optional YouTube key if you use it.
`CLIENT_URL` must be the exact deployed frontend HTTPS origin, without a trailing
slash; multiple origins may be comma-separated. Configure Atlas access for the
hosting environment. Run setup locally against the intended database once; do not
add setup to the deployment build or application startup.

Set the frontend project's `VITE_API_URL` to the backend URL and redeploy it. There
is no `/api` prefix. Both folder READMEs contain the respective setup instructions.
Hosting was not deployed as part of this update.

Express deployment reference: https://vercel.com/docs/frameworks/backend/express

Course prices are display values; payment collection is not implemented. Contact
messages are stored for Admin to read; recovery PINs are sent using Nodemailer. Public course
lists are limited to 100, users to 250, and the inbox to the latest 200 messages.
IP request rate limits use process memory; password-reset account limits and
attempt counts are stored in MongoDB. A larger production service would also
need shared IP rate-limit storage and pagination.

## Verification of this update

The production frontend build and syntax checks for all 24 backend JavaScript
files passed. Thirteen isolated account-flow check groups passed, including demo
protection, teacher approval, PIN expiry/attempt limits, mail failure cleanup,
single-use reset tokens, and session revocation. These used an in-memory model
adapter and Nodemailer's stream transport, without changing your database or
sending live email. All 46 tested text/background palette pairs passed 4.5:1
contrast in both themes; the lowest calculated ratio was 5.97:1.
The editing environment does not provide the required browser preview capability,
so this update has not had a live desktop/mobile browser pass. Remote MongoDB,
SMTP inbox delivery, and live YouTube playback also need verification on your
own connection. Verification tools and fixtures are not included in the app.
