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

## License

MIT — built as a professional interview assignment.
