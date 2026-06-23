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

### 3. Start the database
```bash
# This starts PostgreSQL in Docker (runs in the background)
docker compose up -d
```

### 4. Install and run the backend
```bash
cd server
npm install
npx prisma migrate dev    # creates all database tables
npm run seed              # creates test users and sample data
npm run dev               # starts the backend on http://localhost:3000
```

### 5. Install and run the frontend
```bash
cd client
npm install
npm run dev               # starts the frontend on http://localhost:5173
```

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

## License

MIT — built as a professional interview assignment.
