# RequestFlow 🎓

> A production-grade Support Request Management System for college students and staff.

[![Node.js](https://img.shields.io/badge/Node.js-20.x-green?logo=node.js)](https://nodejs.org/)
[![React](https://img.shields.io/badge/React-18.x-blue?logo=react)](https://react.dev/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-blue?logo=postgresql)](https://www.postgresql.org/)
[![Docker](https://img.shields.io/badge/Docker-Compose-2496ED?logo=docker)](https://docs.docker.com/compose/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

---

## What is RequestFlow?

RequestFlow is a web-based system for managing student support requests in a college environment.

- **Students** submit requests about academic or administrative issues, track their status, add comments, and attach files.
- **Support Representatives** manage all requests, update statuses, assign work, and monitor system activity through a real-time dashboard.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18, Vite, Tailwind CSS, shadcn/ui |
| Backend | Node.js, Express.js |
| Database | PostgreSQL 16 (via Docker) |
| ORM | Prisma |
| Auth | JWT (JSON Web Tokens) |
| Real-Time | Socket.io |
| Email | Nodemailer + Gmail |
| Docs | Swagger / OpenAPI |
| Tests | Jest + Supertest |
| DevOps | Docker + Docker Compose |

---

## Project Structure

```
RequestFlow/
 ├── client/               ← React frontend (Vite + Tailwind)
 ├── server/               ← Node.js backend (Express + Prisma)
 │    ├── src/
 │    │    ├── controllers/   ← handle what each API route does
 │    │    ├── services/      ← business logic
 │    │    ├── routes/        ← URL path definitions
 │    │    ├── middleware/     ← auth, logging, error handling
 │    │    ├── utils/         ← small helper functions
 │    │    ├── config/        ← app configuration
 │    │    └── sockets/       ← real-time WebSocket handlers
 │    ├── prisma/
 │    │    ├── schema.prisma  ← database table definitions
 │    │    └── seed.js        ← creates test data
 │    └── tests/             ← Jest test files
 ├── docker-compose.yml    ← starts the PostgreSQL database
 ├── .env.example          ← template for environment variables
 └── README.md
```

---

## Quick Start (Full Setup)

> Prerequisites: [Node.js 20+](https://nodejs.org/), [Docker Desktop](https://www.docker.com/products/docker-desktop/)

### 1. Clone the repository
```bash
git clone https://github.com/YOUR_USERNAME/RequestFlow.git
cd RequestFlow
```

### 2. Set up environment variables
```bash
# Copy the example and fill in your values
cp .env.example .env
cp server/.env.example server/.env
cp client/.env.example client/.env
```

### 3. Start the entire application
```bash
# This downloads and builds the database, backend server, and frontend website
# and runs them all in the background
docker compose up -d --build
```

### 4. Setup the Database (One-time only)
```bash
# Run migrations and seed data into the Docker container
docker compose exec server npx prisma migrate deploy
docker compose exec server npm run seed
```

### 5. Open the app
- **Frontend Website:** `http://localhost:5173`
- **Backend API Docs:** `http://localhost:3000/api/docs`

---

## Test Credentials

| Role | Email | Password |
|---|---|---|
| Student | student@test.com | password123 |
| Support | support@test.com | password123 |

---

## API Documentation

Once the backend is running, open:
```
http://localhost:3000/api/docs
```
You'll see the full interactive API documentation powered by Swagger.

---

## Running Tests

```bash
cd server
npm test
```

---

## Features

### Core (Assignment Requirements)
- [x] Login screen with role-based redirect
- [x] Student registration with email verification (6-digit code)
- [x] Create a new support request
- [x] View request list (student sees own, support sees all)
- [x] Request detail page with full information
- [x] Comments system (student + support)
- [x] Support can update status and priority
- [x] Support dashboard with analytics
- [x] Search and filtering (status, priority, category, date)

### Professional Extras
- [x] JWT authentication + role-based authorization
- [x] Email verification with 6-digit code (Gmail)
- [x] Middleware stack (auth, logging, CORS, error handling, rate limiting)
- [x] Real-time features with Socket.io (online users, live comment notifications)
- [x] File attachments (images, PDFs)
- [x] Activity timeline on every request
- [x] SLA tracking with visual breach indicators
- [x] Satisfaction rating system
- [x] Ticket assignment to support reps
- [x] Internal comments (support-only notes)
- [x] Swagger API documentation
- [x] Jest automated tests (~20 tests)
- [x] Docker one-command database setup
- [x] Postman API collection
- [x] Seed script for instant test data

---

## Request Categories

| Category | Description |
|---|---|
| Admin | Administrative issues and requests |
| Financial | Tuition, fees, scholarships |
| Exams | Exam scheduling, grades, appeals |
| English Department | Language course issues |
| Medical Approval | Medical certificates and exemptions |

---

## SLA Rules (System-Defined)

Support requests are automatically flagged if not handled within:

| Priority | Deadline |
|---|---|
| High | 24 hours |
| Medium | 48 hours |
| Low | 72 hours |

---

## Git Branch Strategy

Each feature is built on its own branch and merged to `main` when complete:

| Stage | Branch | What Was Built |
|---|---|---|
| 0 | `main` | Base setup — folder structure, Docker, .env, README |
| 1 | `feature/backend-foundation` | Express, Prisma schema, seed script |
| 2 | `feature/auth` | Register, login, JWT, email code verification |
| 3 | `feature/requests-api` | Full request CRUD, role access, file upload |
| 4 | `feature/comments-activity` | Comments, internal notes, activity timeline |
| 5 | `feature/dashboard-api` | Analytics, SLA tracking, satisfaction rating |
| 6 | `feature/realtime` | Socket.io, online users, live notifications |
| 7 | `feature/swagger-docs` | API documentation at /api/docs |
| 8 | `feature/tests` | Jest unit + integration tests |
| 9 | `feature/frontend-foundation` | React + Tailwind + Router + Auth context |
| 10 | `feature/frontend-auth` | Login, register, verify code pages |
| 11 | `feature/frontend-student` | Student dashboard, requests, detail, comments |
| 12 | `feature/frontend-support` | Support dashboard, management controls |
| 13 | `feature/frontend-search` | Search bar, filters, URL-synced |
| 14 | `feature/frontend-realtime` | Toast notifications, live updates |
| 15 | `feature/file-attachments` | Drag-drop upload, preview, download |
| 16 | `feature/polish-and-final` | Docker full setup, Postman collection, final polish |

---

## Development Log

This section explains what was built in each stage, how it works, and why we made certain decisions.

---

### Stage 0 — Base Project Setup

**What was built:**
The foundation of the monorepo — folder structure, environment configuration, Docker setup, and the initial README.

**How it works:**
- The project is split into two folders: `client/` (React frontend) and `server/` (Node.js backend)
- `docker-compose.yml` defines a PostgreSQL database service. Running `docker compose up -d` starts the database in the background with no manual installation needed
- `.env.example` files act as templates — developers copy them to `.env` and fill in real values. The `.env` files are never committed to GitHub (blocked by `.gitignore`)
- `.aiexclude` tells AI coding assistants to never read `.env` files or other sensitive files

**Key decision:** Using Docker for the database means any developer (or interviewer) can get the database running with a single command, regardless of their machine setup.

---

### Stage 1 — Backend Foundation

**What was built:**
The complete backend skeleton — Express server, database schema, seed script, and all middleware.

**How the Express server works:**
Every request that comes in passes through a chain of middleware before reaching the route handler:

```
Request comes in
    ↓
helmet        → adds security headers automatically
    ↓
cors          → allows the React frontend (port 5173) to talk to this backend (port 3000)
    ↓
express.json  → reads the request body and parses it as JSON
    ↓
morgan        → logs the request to the terminal (method, URL, status, time)
    ↓
rate limiter  → blocks an IP if it sends more than 100 requests in 15 minutes
    ↓
Route Handler → the actual function that handles the request
    ↓
Error Handler → catches any error and returns a clean JSON response
```

**How the database schema works:**
Prisma reads `prisma/schema.prisma` and uses it to create real PostgreSQL tables. The schema defines 7 tables:

| Table | Purpose |
|---|---|
| `User` | Both students and support reps (separated by `role` field) |
| `Request` | The support request with status, priority, and category |
| `Comment` | Messages on a request — can be internal (support-only) |
| `Attachment` | Files attached to a request |
| `Activity` | Auto-generated log of every action (builds the timeline) |
| `Notification` | In-app notifications per user |
| `SatisfactionRating` | Student rates a resolved request 1–5 stars |

**How the seed script works:**
Running `npm run seed` clears all old data and creates fresh test data:
- 2 student users + 2 support users (all with password `password123`)
- 5 requests across different categories and statuses
- Comments, activity logs, and a satisfaction rating

**Key decision:** We used **Prisma 5** instead of the latest version (v7). Prisma 7 made breaking changes to how the database URL is configured. Prisma 5 is stable, widely used in production, and works the classic way.

**Important note — Docker port:**
A local PostgreSQL was already installed on this machine and running on port `5432`. Docker's container was changed to use port `5433` to avoid conflict. The `DATABASE_URL` in `server/.env` uses `localhost:5433`.

---

### Stage 2 — Authentication System

**What was built:**
Complete authentication — register, email verification with 6-digit code, login, and JWT-protected routes.

**How registration works:**
```
User fills register form
    ↓
Backend creates account (password hashed with bcrypt, isVerified = false)
    ↓
6-digit code generated → stored in DB with 10-minute expiry
    ↓
Code sent to user's Gmail via Nodemailer
    ↓
User types code in the app → backend checks it → account activated
```

**How login works:**
```
User submits email + password
    ↓
Backend finds user by email
    ↓
bcrypt.compare() checks if the password matches the hashed version in DB
    ↓
If account is not verified → 403 error (must verify email first)
    ↓
If credentials are correct → JWT token is created and returned
    ↓
Frontend stores the token and sends it with every future request
```

**How JWT token protection works:**
```
Request arrives at a protected route (e.g. GET /api/auth/me)
    ↓
authenticate.js middleware reads the Authorization header
    ↓
jwt.verify() checks the token is real and not expired
    ↓
User info (id, role, name) is attached to req.user
    ↓
Route handler runs and can use req.user freely
```

**How role authorization works:**
```
POST /api/requests/:id  →  authenticate  →  authorize('SUPPORT')  →  handler
                                ↑                    ↑
                        is logged in?        is user a SUPPORT rep?
                        (checks JWT)         (checks req.user.role)
```

**Files added in this stage:**
| File | Purpose |
|---|---|
| `src/utils/generateCode.js` | Generates a random 6-digit number |
| `src/utils/sendEmail.js` | Sends HTML emails via Gmail using Nodemailer |
| `src/middleware/authenticate.js` | Verifies JWT token on every protected route |
| `src/middleware/authorize.js` | Checks if user has the required role |
| `src/services/auth.service.js` | Business logic for register, verify, login |
| `src/controllers/auth.controller.js` | HTTP layer — reads request, calls service, sends response |
| `src/routes/auth.routes.js` | Defines the URL paths and connects them to controllers |

**API endpoints added:**
| Method | URL | Description |
|---|---|---|
| POST | `/api/auth/register` | Create account, sends 6-digit code to email |
| POST | `/api/auth/verify-code` | Activate account using the 6-digit code |
| POST | `/api/auth/resend-code` | Request a new code if the old one expired |
| POST | `/api/auth/login` | Login and receive JWT token |
| GET | `/api/auth/me` | Get current user info (protected) |

---

### Stage 3 — Requests API

**What was built:**
Full CRUD API for support requests with advanced search, filtering, role-based access, file upload support, custom request logging, and automatic activity history logs.

**Key features and how they work:**
- **Request Creation with Attachments:** Students can create support requests. If they upload a file (images or PDF up to 5MB), the system uses `multer` to save it to disk under `server/uploads/` with a unique timestamped filename, creating an attachment record in the database linked to the request.
- **Role-Based List and Scope:** Students can ONLY list and view their own requests. Support reps can list and view all requests in the system.
- **Search & Filtering:** Supports searching request titles and descriptions (case-insensitive) along with filtering by status, priority, category, date range, or student ID.
- **Role-Based Management (Support-Only updates):** Support reps can update status, priority, and assignees. This is restricted from students.
- **Auto Activity Logs (Request Timeline):** Every major action (request creation, status update, priority change, or assignee modification) automatically logs an entry in the `Activity` table to compile a real-time historical timeline for the ticket.
- **Custom requestLogger Middleware:** Tracks and prints method, requested URL, response status, authenticated user ID, and response duration in milliseconds.

**Files added in this stage:**
| File | Purpose |
|---|---|
| `src/middleware/upload.js` | Configures Multer storage, file filtering, and size limit requirements |
| `src/middleware/logging.js` | Custom middleware that prints a detailed log of every request-response cycle |
| `src/utils/activityLogger.js` | Failsafe utility to log timeline entries into the Activity table |
| `src/services/request.service.js` | Business logic layer containing DB transactions, filters, and validations |
| `src/controllers/request.controller.js` | Controller mapping request data, error catches, and role verifications |
| `src/routes/request.routes.js` | Defines the API routes, Multer wrapper, and JSDoc OpenAPI specs |

**API endpoints added:**
| Method | URL | Protected By | Role Allowed | Description |
|---|---|---|---|---|
| POST | `/api/requests` | JWT | `STUDENT` | Creates a new request (optional file upload) |
| GET | `/api/requests` | JWT | `STUDENT` or `SUPPORT` | Lists/filters requests (scoped by role) |
| GET | `/api/requests/search` | JWT | `STUDENT` or `SUPPORT` | Alias to filter and search requests |
| GET | `/api/requests/:id` | JWT | `STUDENT` (own) or `SUPPORT` (all) | Retrieve request details and activity log |
| PATCH | `/api/requests/:id` | JWT | `SUPPORT` | Update status, priority, or assign support rep |

---

### Stage 4 — Comments & Activity Timeline

**What was built:**
A nested messaging thread (comments) and activity history timeline per support ticket, supporting public comments for general communication and internal notes restricted strictly to support representatives.

**Key features and how they work:**
- **Double-Layered Comments Thread:** Students and support representatives can communicate in real time on tickets. Support representatives have the option to set an `isInternal: true` flag to post private administrative notes that other support agents can see, but students cannot.
- **Data Leak Prevention (Privacy Scoping):** If a student attempts to query comments or activity timelines, the backend automatically intercepts and filters out comments marked as internal, along with any activity log entries related to internal updates (such as "John Support added an internal note").
- **Auto Activity Log Tracking:** Posting a public or internal comment automatically records a corresponding event tracking log in the request's historical ledger.

**Files added/modified in this stage:**
| File | Action | Purpose |
|---|---|---|
| `src/services/comment.service.js` | [NEW] | Handles comment creations, visibility scoping by user role, and timeline history listings |
| `src/controllers/comment.controller.js` | [NEW] | Controller mapping comment params, internal toggles, and status/security catches |
| `src/routes/request.routes.js` | [MODIFY] | Registers nested paths (`/requests/:id/comments` and `/requests/:id/activity`) with their OpenAPI annotations |

**API endpoints added:**
| Method | URL | Protected By | Role Allowed | Description |
|---|---|---|---|---|
| POST | `/api/requests/:id/comments` | JWT | `STUDENT` (own) or `SUPPORT` (all) | Appends a comment to a request (support can toggle `isInternal`) |
| GET | `/api/requests/:id/comments` | JWT | `STUDENT` (own) or `SUPPORT` (all) | Lists all comments (scoped/filtered by role visibility) |
| GET | `/api/requests/:id/activity` | JWT | `STUDENT` (own) or `SUPPORT` (all) | Returns the ticket's activity timeline (internal notes logs hidden from student) |

---

### Stage 5 — Dashboard & Analytics API

**What was built:**
A comprehensive dashboard metrics aggregator, SLA breach tracking, and a student satisfaction rating feedback API.

**Key features and how they work:**
- **Dashboard Stats Aggregation:** Support reps can query overall support statistics. It calculates total tickets, state distribution counts, average response time (from `OPEN` to `IN_PROGRESS` based on timeline transition timestamps), average student satisfaction rating, SLA breach counts, and the top ticket category.
- **Dynamic SLA Breach Check:** Evaluates ticket response deadlines based on priority thresholds (High priority: 24h, Medium priority: 48h, Low priority: 72h). Tickets that exceed these hours are dynamically updated and flagged as SLA breaches in the database.
- **Student Satisfaction Ratings:** Students can submit a star rating feedback (1 to 5 stars) once their ticket status is resolved or closed. Submitting feedback inserts a SatisfactionRating record and registers a corresponding timeline event.
- **Agent Satisfaction Matrix:** Support agents can view satisfaction score ranking lists tracking average star feedback scores and total ratings received per agent.

**Files added/modified in this stage:**
| File | Action | Purpose |
|---|---|---|
| `src/services/dashboard.service.js` | [NEW] | Handles database aggregation queries, SLA checking math, satisfaction rating creations, and agent stats |
| `src/controllers/dashboard.controller.js` | [NEW] | Controller mapping feedback body schemas, stats, and breaches list payloads |
| `src/routes/dashboard.routes.js` | [NEW] | Registers router endpoints for statistics and SLA queries with JSDoc OpenAPI specs |
| `src/routes/request.routes.js` | [MODIFY] | Registers the ticket satisfaction feedback rating route (`POST /requests/:id/rate`) |
| `src/server.js` | [MODIFY] | Mounts dashboard route endpoints under `/api/dashboard` |

**API endpoints added:**
| Method | URL | Protected By | Role Allowed | Description |
|---|---|---|---|---|
| POST | `/api/requests/:id/rate` | JWT | `STUDENT` | Submit a satisfaction star feedback rating (1-5) on a resolved ticket |
| GET | `/api/dashboard/stats` | JWT | `SUPPORT` | Compiles global dashboard stats and averages |
| GET | `/api/dashboard/sla-breaches` | JWT | `SUPPORT` | Lists all tickets exceeding response time SLA thresholds |
| GET | `/api/dashboard/satisfaction` | JWT | `SUPPORT` | Compiles average satisfaction rating and feedback counts per agent |

---

### Stage 6 — Real-Time Features (WebSockets)

**What was built:**
Full Socket.io real-time server integration facilitating instant in-app alerts, dynamic updates, and support agent tracking of online users.

**Key features and how they work:**
- **Secure Socket Connections:** Socket handshakes require authentication. A client connects by passing a JWT token in `auth.token`, verified on connection via `jsonwebtoken`. Invalid or expired tokens result in socket disconnection.
- **Dynamic Notifications & Alerts:** When a support agent modifies a ticket (status, priority, assignee changes) or posts a public comment, an in-app `Notification` record is saved to the database, and a real-time `notification:new` and `request:updated` / `comment:new` event is pushed instantly to the student.
- **Support-Only Room & Online Roster:** Support reps connect to a designated `support_room` room. Connecting and disconnecting events dynamically maintain an online roster. Support reps receive live lists containing all currently connected students and agents (`users:online` event) without manual refreshing.
- **Graceful Notification Fallback:** The notification service failsafe captures error bounds, ensuring a failure in real-time emissions does not crash standard HTTP response workflows.

**Files added/modified in this stage:**
| File | Action | Purpose |
|---|---|---|
| `src/sockets/socket.js` | [NEW] | Initializes Socket.io, verifies handshakes, maps active connections, and manages rooms |
| `src/services/notification.service.js` | [NEW] | Persists notifications to DB and emits socket notification events to targets |
| `src/controllers/notification.controller.js` | [NEW] | Exposes notifications queries and read operations |
| `src/routes/notification.routes.js` | [NEW] | Registers notification paths with their Swagger annotations |
| `src/services/request.service.js` | [MODIFY] | Triggers notifications and socket updates when tickets undergo mutations |
| `src/services/comment.service.js` | [MODIFY] | Triggers comment-added events for students and broadcasts internal notes to reps |
| `src/server.js` | [MODIFY] | Mounts notifications API routes under `/api/notifications` and initializes socket manager |

**API endpoints added:**
| Method | URL | Protected By | Role Allowed | Description |
|---|---|---|---|---|
| GET | `/api/notifications` | JWT | Anyone | List all notifications for the authenticated user |
| POST | `/api/notifications/read-all` | JWT | Anyone | Mark all user notifications as read |
| PATCH | `/api/notifications/:id/read` | JWT | Anyone | Mark a single notification as read |

---

### Stage 7 — Swagger API Documentation

**What was built:**
A comprehensive interactive Swagger documentation page served dynamically at `/api/docs` exposing all Auth, Requests, Comments, Feedback, and Notifications API endpoints.

**Key features and how they work:**
- **Dynamic OpenAPI Specs Generation:** Integrated `swagger-jsdoc` and `swagger-ui-express` to compile JSDoc inline endpoint comments in route files.
- **Bearer JWT Authentication Integration:** The documentation page supports interactive JWT authentication. Developers can submit their Bearer token in the Swagger UI components to execute authorized requests.
- **Detailed Parameter & Schema Documentation:** Outlined input body parameters, query filter parameters, path parameters, and status responses (200, 201, 400, 401, 403, 404) for all available paths.

**Files added/modified in this stage:**
All Swagger integrations were coded dynamically during endpoint design cycles. No new modifications were needed for this stage as all 4 route files are fully documented and exposed.

---

### Stage 8 — Backend Tests (Jest)

**What was built:**
A comprehensive automated integration and unit test suite containing 30 test cases written in Jest and Supertest, verifying all authentication flows, request CRUD operations and role permissions, dashboard analytics, SLA calculations, and in-app notifications.

**Key features and how they work:**
- **Database Isolation:** Programmed dynamic redirection of `DATABASE_URL` inside `tests/setup.js` to automatically target a separate database `requestflow_test` during runs. This protects your development database (`requestflow_db`) from getting wiped or having seed records deleted.
- **Auto-Sync Schema:** The setup script automatically triggers `npx prisma db push` before running tests to guarantee the test database has the latest PostgreSQL tables without manual intervention.
- **Fast Mocking:** Globally mocked the `sendEmail.js` Nodemailer utility to bypass SMTP connections, allowing tests to run rapidly and offline.
- **Clean State Isolation:** A database table cleaner runs in `beforeEach()` to wipe test data, guaranteeing clean environment starting blocks for every single test case.
- **Test Coverage:** Covers registration, code verification, login, current user lookup (`/me`), request creation permissions (student-only), scoped listing views (students see own, support reps see all), comments scoping (public comments for students, public + internal comments for support), dynamic SLA breach checks on overdue tickets, average agent rating scoring, and notifications reading.

**How to run tests:**
Navigate to the `server/` directory and run:
```bash
npm test
```

**Files added/modified in this stage:**
- [package.json](file:///Users/anansafady/CS%20/VS%20code%20projects/RequestFlow%20/RequestFlow-/server/package.json) [MODIFY] — Configured Jest `setupFilesAfterEnv` path.
- [server.js](file:///Users/anansafady/CS%20/VS%20code%20projects/RequestFlow%20/RequestFlow-/server/src/server.js) [MODIFY] — Prevented starting HTTP server on ports during testing.
- [request.controller.js](file:///Users/anansafady/CS%20/VS%20code%20projects/RequestFlow%20/RequestFlow-/server/src/controllers/request.controller.js) [MODIFY] — Handled invalid category/priority errors in response code formatting.
- [setup.js](file:///Users/anansafady/CS%20/VS%20code%20projects/RequestFlow%20/RequestFlow-/server/tests/setup.js) [NEW] — Dynamic DB router, global mock definitions, schema syncing, and DB table wipes.
- [auth.test.js](file:///Users/anansafady/CS%20/VS%20code%20projects/RequestFlow%20/RequestFlow-/server/tests/auth.test.js) [NEW] — Tests for the auth system endpoints.
- [requests.test.js](file:///Users/anansafady/CS%20/VS%20code%20projects/RequestFlow%20/RequestFlow-/server/tests/requests.test.js) [NEW] — Tests for request creation, visibility, comment separations, and rating submissions.
- [dashboard.test.js](file:///Users/anansafady/CS%20/VS%20code%20projects/RequestFlow%20/RequestFlow-/server/tests/dashboard.test.js) [NEW] — Tests for dashboard analytics compilation, SLA overdue thresholds, and agent satisfaction tracking.
- [notifications.test.js](file:///Users/anansafady/CS%20/VS%20code%20projects/RequestFlow%20/RequestFlow-/server/tests/notifications.test.js) [NEW] — Tests for notification lists and read state updates.

---

### Stage 9 — Frontend Foundation

**What was built:**
The foundational skeleton for the React frontend, structured to support light/dark modes, secure client routing, responsive navigation layouts, Axios API integration, and real-time Socket.io state.

**Key features and how they work:**
- **Vite React SPA & TailwindCSS CSS variables:** Initialized Vite-based React project styled with vanilla CSS variables mapped dynamically to Tailwind tokens, enabling class-based dynamic dark mode toggling.
- **State contexts:** Programmed `AuthContext` (JWT session restoration, API registration/login actions) and `SocketContext` (auto websocket instantiation on active login).
- **Session expiration interceptors:** The Axios API client intercepts standard `401 Unauthorized` responses to clear invalid/expired storage keys and redirect students back to the login view with an `expired=true` URL warning parameter.

---

### Stage 10 — Auth UI (Login, Register & Verify Email)

**What was built:**
Production-ready authentication views styled with glassmorphism overlays, form validation, loader spinners, and dynamic alert banners. Includes local terminal fallback logging for verification codes.

**Key features and how they work:**
- **Comprehensive Page Views:**
  - **Login:** Inputs with strict validation, loading states, and notification panels that dynamically process `?verified=true` or `?expired=true` query parameters.
  - **Register:** Interactive custom cards for role selections (`STUDENT` or `SUPPORT`), email/password validation, and automatic redirect to the verification page passing the email parameter.
  - **Verify Email:** A 6-box mono-spaced verification input block equipped with an automatic countdown and a "Resend Code" loading hook.
- **Fail-safe Terminal Fallback:** When email service environment variables are not configured in dev, the server email client prints registration verification codes in a clean CLI card box inside node server console logs.

**Files added/modified in this stage:**
- [Login.jsx](file:///Users/anansafady/CS%20/VS%20code%20projects/RequestFlow%20/RequestFlow-/client/src/pages/Login.jsx) [MODIFY] — Handled forms, banners, and redirects.
- [Register.jsx](file:///Users/anansafady/CS%20/VS%20code%20projects/RequestFlow%20/RequestFlow-/client/src/pages/Register.jsx) [MODIFY] — Setup role selectors, input validation.
- [VerifyEmail.jsx](file:///Users/anansafady/CS%20/VS%20code%20projects/RequestFlow%20/RequestFlow-/client/src/pages/VerifyEmail.jsx) [MODIFY] — Verification code field and resend actions.
- [sendEmail.js](file:///Users/anansafady/CS%20/VS%20code%20projects/RequestFlow%20/RequestFlow-/server/src/utils/sendEmail.js) [MODIFY] — Local terminal fallback card generator.

---

### Stage 11 — Student UI

**What was built:**
The complete student-facing workspace including the main landing dashboard with aggregated metrics, a filtered ticket search and listings table, a multipart ticket creation form with attachments, and an interactive conversation detail workspace.

**Key features and how they work:**
- **Calculated Dashboard Metrics:** Since admin dashboard APIs are blocked for student roles, the landing student dashboard compiles stats counts (total, open, resolved, closed) directly from the retrieved array of student requests in the client-side state.
- **Advanced Query Filters:** The listings index features synchronous text search and dropdown status, category, and priority filters that dynamically trigger debounced backend requests.
- **Multipart Form Submissions:** The creation form gathers title, description, category, and priority options, and appends them alongside an optional file binary using browser `FormData` to handle multipart uploads securely.
- **Chronological Discussion Timeline:** The workspace dynamically fetches comments and activity logs and merges them into a single sorted chronological feed. Student comments are rendered on the right with a vibrant primary color while updates and assignee events render as centered system activity rows.
- **Interactive Feedback Rating:** Renders a 5-star rating feedback widget on resolved/closed tickets allowing students to submit satisfaction feedback immediately, locking down the selected score once saved.

**Files added/modified in this stage:**
- [App.jsx](file:///Users/anansafady/CS%20/VS%20code%20projects/RequestFlow%20/RequestFlow-/client/src/App.jsx) [MODIFY] — Registered the detailed request view route.
- [StudentDashboard.jsx](file:///Users/anansafady/CS%20/VS%20code%20projects/RequestFlow%20/RequestFlow-/client/src/pages/StudentDashboard.jsx) [MODIFY] — Displays ticket summary counts and quick links.
- [StudentRequests.jsx](file:///Users/anansafady/CS%20/VS%20code%20projects/RequestFlow%20/RequestFlow-/client/src/pages/StudentRequests.jsx) [MODIFY] — Search input, category filters, and requests tables.
- [CreateRequest.jsx](file:///Users/anansafady/CS%20/VS%20code%20projects/RequestFlow%20/RequestFlow-/client/src/pages/CreateRequest.jsx) [MODIFY] — Urgency selections, validation, and attachment upload fields.
- [RequestDetails.jsx](file:///Users/anansafady/CS%20/VS%20code%20projects/RequestFlow%20/RequestFlow-/client/src/pages/RequestDetails.jsx) [NEW] — Single ticket conversation workspace and rating widget.

---

### Stage 12 — Support UI

**What was built:**
The complete support-facing workspace including the dashboard analytics, a global ticket management list, and the ticket resolution workspace with internal agent notes.

**Key features and how they work:**
- **Dynamic Dashboard Analytics:** Fetches and renders real-time stats including total requests, open tickets, SLAs breached, average response time, top category, and an agent satisfaction matrix.
- **Global Ticket Search & Filters:** Similar to the student view, but exposes all tickets across the system to support reps. Includes text search, category, status, and priority dropdowns.
- **Support Ticket Workspace:** Allows agents to update the ticket's priority, status, and assignment. Displays SLA breach badges if overdue.
- **Internal Notes:** Agents can toggle an "Internal Note" checkbox when posting a comment. These notes render with a distinct amber styling and a lock icon, completely hidden from the student's timeline view but visible to other support reps.

**Files added/modified in this stage:**
- `App.jsx` [MODIFY] — Registered support routing layouts.
- `SupportDashboard.jsx` [NEW] — Dashboard metrics aggregator and SLA breach warnings.
- `SupportRequests.jsx` [NEW] — Global tickets index with filtering.
- `SupportRequestDetails.jsx` [NEW] — Unified ticket details workspace featuring the timeline, form controls for status/priority updates, assignee management, and internal notes functionality.

---

### Stage 13 — Search & Filtering

**What was built:**
Refactored the filtering functionality to sync search and filter states with URL query parameters using React Router.

**Key features and how they work:**
- **URL-Synced State:** Search term, category, status, and priority filters are all connected to the browser's URL via `useSearchParams`. 
- **Persisted State on Reload:** If you copy and share a filtered URL or refresh the page, the filters seamlessly remount with their expected values, ensuring context isn't lost.
- **Helper Integration:** Constructed local helper functions to set query parameters without obliterating other active filters or pushing unnecessary history blocks.

**Files added/modified in this stage:**
- [StudentRequests.jsx](file:///Users/anansafady/CS%20/VS%20code%20projects/RequestFlow%20/RequestFlow-/client/src/pages/StudentRequests.jsx) [MODIFY] — Swapped `useState` hooks for `useSearchParams`.
- [SupportRequests.jsx](file:///Users/anansafady/CS%20/VS%20code%20projects/RequestFlow%20/RequestFlow-/client/src/pages/SupportRequests.jsx) [MODIFY] — Swapped `useState` hooks for `useSearchParams`.

---

### Stage 14 — Real-time Frontend (Socket.io)

**What was built:**
Connected the React frontend to the Node.js Socket.io server to enable real-time notifications, a live online users tracker, and instant UI updates without page reloads.

**Key features and how they work:**
- **Context-driven WebSockets:** Initialized the Socket.io client inside a `SocketContext` that automatically connects and authenticates using the JWT token from `localStorage` whenever a user signs in.
- **Global Toast System:** Engineered a custom `ToastContext` using Lucide icons to fire animated pop-up alerts whenever a `notification:new` socket event fires.
- **Notification Dropdown:** Added a dropdown to the navbar bell icon. It polls the database on load for historical notifications, prepends live socket notifications, and marks notifications as read via API calls.
- **Live User Tracker:** The Support Dashboard listens to the `users:online` broadcast to render a pulsing, dynamic list of currently connected staff and students.
- **Instant Detail Refresh:** When viewing a ticket in either `RequestDetails.jsx` or `SupportRequestDetails.jsx`, the components listen for `comment:new` and `request:updated` events. If the incoming event's `requestId` matches the open ticket, the UI seamlessly fetches the fresh data and appends it to the timeline, guaranteeing users never miss a message.

**Files added/modified in this stage:**
- [SocketContext.jsx](file:///Users/anansafady/CS%20/VS%20code%20projects/RequestFlow%20/RequestFlow-/client/src/context/SocketContext.jsx) [NEW] — Wrapped socket initialization logic.
- [ToastContext.jsx](file:///Users/anansafady/CS%20/VS%20code%20projects/RequestFlow%20/RequestFlow-/client/src/context/ToastContext.jsx) [NEW] — Lightweight global toast notification provider.
- [Navbar.jsx](file:///Users/anansafady/CS%20/VS%20code%20projects/RequestFlow%20/RequestFlow-/client/src/components/layout/Navbar.jsx) [MODIFY] — Handled socket notifications and built the read/unread dropdown.
- [SupportDashboard.jsx](file:///Users/anansafady/CS%20/VS%20code%20projects/RequestFlow%20/RequestFlow-/client/src/pages/SupportDashboard.jsx) [MODIFY] — Added the live online users widget.
- [RequestDetails.jsx](file:///Users/anansafady/CS%20/VS%20code%20projects/RequestFlow%20/RequestFlow-/client/src/pages/RequestDetails.jsx) & [SupportRequestDetails.jsx](file:///Users/anansafady/CS%20/VS%20code%20projects/RequestFlow%20/RequestFlow-/client/src/pages/SupportRequestDetails.jsx) [MODIFY] — Added socket listeners to refetch the timeline upon real-time updates.

---

### Stage 15 — File Attachments

**What was built:**
Upgraded the basic file attachment inputs into a modern, interactive drag-and-drop zone, and introduced dynamic image thumbnail previews within the ticket timeline workspaces.

**Key features and how they work:**
- **Drag-and-Drop Zone:** Replaced the standard `<input type="file" />` in `CreateRequest.jsx` with a custom area that responds to `onDragOver`, `onDragLeave`, and `onDrop` events. It applies scaling and glowing border CSS effects while a file is hovered over the area.
- **Client-Side Validation:** Immediately validates file size (max 5MB) and mime type (JPG, PNG, PDF) during the drop event before touching the backend APIs.
- **Dynamic Previews:** Instead of rendering a generic file link for every attachment, the ticket details pages check if the file's `mimetype` starts with `image/`. If true, it renders a full image thumbnail using `http://localhost:3000/uploads/...` with a neat hover overlay. If it's a PDF, it falls back to a clean document card.

**Files added/modified in this stage:**
- [CreateRequest.jsx](file:///Users/anansafady/CS%20/VS%20code%20projects/RequestFlow%20/RequestFlow-/client/src/pages/CreateRequest.jsx) [MODIFY] — Implemented the drag-and-drop zone and selected file preview card.
- [RequestDetails.jsx](file:///Users/anansafady/CS%20/VS%20code%20projects/RequestFlow%20/RequestFlow-/client/src/pages/RequestDetails.jsx) & [SupportRequestDetails.jsx](file:///Users/anansafady/CS%20/VS%20code%20projects/RequestFlow%20/RequestFlow-/client/src/pages/SupportRequestDetails.jsx) [MODIFY] — Implemented image thumbnail previews for attachments.

---

### Stage 16 — Polish and Final

**What was built:**
The final sprint of the project. Focused strictly on documentation, test-environment portability, and ensuring evaluators can seamlessly review the code.

**Key features and how they work:**
- **Full Stack Containerization:** Completely rewrote `docker-compose.yml` and added Dockerfiles to containerize the **entire** application. Reviewers can now spin up the Database, Node.js Backend, and an Nginx-served React Frontend with a single `docker compose up` command.
- **Postman Collection Export:** Generated a `RequestFlow.postman_collection.json` file in the root directory. Reviewers can import this into Postman to instantly test Authentication, Request CRUD, and Dashboard analytics APIs without manually constructing payloads.
- **Database Seed Failsafe:** Retained the `seed.js` script to instantly generate realistic students, support reps, mock requests, SLA breaches, and satisfaction ratings right out of the box.

---

## License

MIT — built as a professional interview assignment.





