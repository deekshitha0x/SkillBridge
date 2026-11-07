# SkillBridge: Verified Skill Mapping & Hiring Platform (MVP)

SkillBridge is a skill-verification and hiring platform built for Smart India Hackathon (SIH 2026). It enables a proof-of-capability pipeline for three distinct user roles (**Student**, **Recruiter**, and **Institution**).

---

## 💻 Tech Stack

- **Frontend**: React (v19), Vite (v6), Tailwind CSS, Lucide Icons, React Router (v7)
- **Backend**: Node.js, Express.js (REST API), CORS
- **Database & ORM**: PostgreSQL, Prisma ORM (v6)
- **Authentication**: JWT (JSON Web Tokens) with role-based route guards and mock OAuth/demo evaluation flows

---

## 🚀 Core User Loop

```
Claim Skill ──► Take Assessment ──► Verified Skill Badge ──► Discover Job
                                                                  │
Level Advancement ◄── Recruiter Verifies ◄── Challenge-to-Hire ◄─┘
```

---

## ✨ Features by Role

### 🎓 Student
- **Skill Claiming & Profile**: Claim skills, track skill levels (0 to 5), and showcase verified credential badges.
- **Assessment Quizzes**: Take skill assessment quizzes with anti-cheat monitoring (tab-switch detection and server-synchronized duration tracking) to earn claimed status.
- **Job Discovery & Prerequisite Matching**: Browse jobs, view required skill matrices, check eligibility reasons, and explore similar jobs based on skill overlap.
- **Hiring Challenges & Pre-Verified Waivers**: Solve company code challenges or bypass re-assessment using pre-verified waivers when all prerequisite skills are already verified.

### 🏢 Recruiter
- **Job & Challenge Authoring**: Post job openings and configure challenge prompts with explicit required skill levels.
- **Waiver Policy Control**: Toggle pre-verified waiver allowances per challenge (`allowWaiver`).
- **Code Submission Review**: Inspect candidate code, evaluate hiring status, and verify or advance student skill levels via atomic database transactions.
- **Candidate Pool**: Discover and inspect qualified student profiles filtered by verified proficiency levels.

### 🏛️ Institution
- **Campus Analytics Dashboard**: Monitor aggregate skill distributions across departments.
- **Proficiency Matrix**: Track verified talent counts (Level 2+) per skill across the student population.
- **Student Readiness**: Review campus-wide verified skill matrices to evaluate curriculum readiness.

---

## 🛠️ Repository & Architecture Structure

```
/SkillBridge
├── /client (React + Vite + Tailwind CSS)
│   ├── /src
│   │   ├── /pages
│   │   │   ├── Landing.jsx            # Public landing page ("/", no auth required)
│   │   │   ├── Login.jsx              # Demo Auth gateway, Mock OAuth & Simulated Aadhaar onboarding
│   │   │   ├── /student               # Dashboard, SkillProfile, SkillAssessment, Jobs, JobDetail, ChallengeDetail
│   │   │   ├── /recruiter             # Dashboard, NewJob, Candidates, Submissions
│   │   │   └── /institution           # Dashboard (Aggregate skill stats)
│   │   ├── /components
│   │   │   ├── /ui                    # Button, Badge, Card, ProgressBar
│   │   │   ├── /skills                # SkillCard, SkillProfileTable, VerifiedBadge
│   │   │   ├── /jobs                  # JobCard, RequiredSkillsTable, SimilarJobsList
│   │   │   └── /challenges            # ChallengeCard, SubmissionForm
│   │   ├── /lib/api.js                # Fetch wrapper attaching Bearer JWT token header
│   │   ├── /context/AuthContext.jsx   # Auth state provider (JWT, role, demo switchers)
│   │   └── /routes/AppRoutes.jsx      # React Router with RequireAuth & RequireRole guards
│   ├── .env.example                   # VITE_API_URL template
│   └── .env                           # VITE_API_URL=http://localhost:5000
│
└── /server (Node.js + Express.js + Prisma ORM)
    ├── /src
    │   ├── server.js                  # Main Express app (CORS configured for client)
    │   ├── /routes                    # auth, skills, assessments, jobs, challenges, profile, institution
    │   ├── /middleware                # requireAuth.js (JWT), requireRole.js (student/recruiter/institution)
    │   └── /lib                       # matching.js (rule-based matching), eligibility.js (skill prerequisite checker)
    ├── /prisma                        # schema.prisma, seed.js (PostgreSQL schema & mock data)
    ├── .env.example                   # DATABASE_URL, JWT_SECRET, PORT template
    └── .env                           # DATABASE_URL, JWT_SECRET, PORT=5000
```

---

## 📋 Prerequisites & Local Setup

### Prerequisites
Before running SkillBridge, ensure you have the following installed on your machine:
- **Node.js**: Minimum `v18.18.0+` (`v20+` LTS recommended). Verify with `node -v`.
- **npm**: Minimum `v9+` (bundled with Node.js). Verify with `npm -v`.
- **PostgreSQL**: Minimum `v12+` (`v14+` or `v16+` recommended) running locally on port 5432.
- **psql CLI**: Ensure `psql` is available on your system `PATH` to run database creation commands from the terminal.

---

### 1. PostgreSQL Database Initialization

Create a PostgreSQL database named `skillbridge`:

#### Option A: Command Line (macOS / Linux / Windows with `psql` in PATH)
```bash
psql -U postgres -c "CREATE DATABASE skillbridge;"
```

#### Option B: pgAdmin GUI (Alternative for Windows / GUI users)
1. Open **pgAdmin** and connect to your local PostgreSQL server.
2. In the left browser tree, right-click **Databases** ➔ **Create** ➔ **Database...**.
3. In the dialog, set **Database** name to `skillbridge` and click **Save**.

---

### 2. Environment Variables Configuration

Copy the example environment files for both the server and client, then edit the values:

```bash
# In project root:
cp server/.env.example server/.env
cp client/.env.example client/.env
```

#### Server Configuration (`server/.env`):
```env
PORT=5000
DATABASE_URL="postgresql://postgres:YOUR_PASSWORD@localhost:5432/skillbridge?schema=public"
JWT_SECRET="your_jwt_secret_here"
GOOGLE_CLIENT_ID="mock-google-client-id.apps.googleusercontent.com"
GOOGLE_CLIENT_SECRET="mock-google-client-secret"
```
> **Note on `JWT_SECRET`**: Replace with your own long random string for production or local testing. You can generate a secure 32-byte secret using:
> ```bash
> openssl rand -hex 32
> ```
> Replace `YOUR_PASSWORD` in `DATABASE_URL` with your local PostgreSQL user password.

#### Client Configuration (`client/.env`):
```env
VITE_API_URL=http://localhost:5000
```

---

## ⚡ Running Migrations & Seeding

Navigate to `/server` and run the database migrations and seed script:
```bash
cd server
npm install
npx prisma migrate dev
npx prisma db seed
```

This populates the database with:
- 1 Institution (*National Institute of Technology*)
- 3 Students (*Alex Chen, Priya Sharma, Rohan Gupta*)
- 6 Skills (*Python, SQL, C++, Data Structures, React, Communication*)
- 4 Companies & Jobs (*TechCorp, CloudScale, DataFlow, SystemX*)
- 2 Hiring Challenges with sample code submissions
- Multiple-choice assessment quizzes for all skills

---

## 🏃 Running Client & Server Together

Open two separate terminal windows:

### Terminal 1: Backend Server (Port 5000)
```bash
cd server
npm run dev
```

### Terminal 2: Frontend Client (Port 5173)
```bash
cd client
npm install
npm run dev
```

Visit **`http://localhost:5173/`** in your browser.

---

## 🔑 Demo Login Accounts & Authentication Note

> **Note on Authentication**: Google OAuth and the Aadhaar verification step are **simulated / mocked** for the SIH MVP evaluation. The **one-click demo login buttons** on `/login` are the primary and intended way to test the platform without needing third-party credentials.

You can test all 3 roles instantly from `/login` using the zero-friction demo buttons:

1. **Student**: Log in as *Alex Chen* (Claim skills, attempt assessment quizzes with anti-cheat monitoring (tab-switch detection and duration tracking), check job prerequisites, submit challenge solutions, or use pre-verified waivers).
2. **Recruiter**: Log in as *TechCorp Recruiter* (Post new jobs/challenges, review code solutions, toggle waiver allowance, approve & verify skill levels in single Prisma transactions).
3. **Institution**: Log in as *NIT Dean* (View campus aggregate skill distributions, level 2+ proficiency matrix, and student leaderboards).

---

## 🧩 Architectural Highlights & Core Design

- **Anti-Cheat Monitoring**: Assessment quizzes feature anti-cheat monitoring (tab-switch detection and duration tracking) via client-side `visibilitychange` listeners and server-synchronized countdown timer sessions stored on the submission.
- **Rule-Based Matching Module**: `server/src/lib/matching.js` exports `getSimilarJobs(jobId)` ranking job overlap based on skill intersections.
- **Atomic Transactions**: Recruiter reviews execute inside a single `prisma.$transaction()` to atomically update `StudentSkill` levels.

---

## ⚠️ Limitations

- **Simulated Identity & Auth**: Google OAuth and Aadhaar verification are simulated/mocked for MVP evaluation; no external UIDAI or Google OAuth APIs are called.
- **Rule-Based Matching**: Job similarities and prerequisite checks use direct skill overlap counting rather than machine-learning or semantic vector embeddings.
- **Browser-Level Anti-Cheat**: Anti-cheat monitoring tracks browser tab visibility changes and enforces server-tracked countdown timers rather than operating as native device-level or webcam proctoring.
- **Local MVP Scope**: The platform is an MVP scaffold configured for local development and hackathon demonstration, without production-grade secret vaults, rate limiting, or automated container deployment.

---

## 🛠️ Troubleshooting

### 1. Port 5000 Already in Use on macOS (AirPlay Receiver)
On macOS Monterey and later, Apple's **AirPlay Receiver** service listens on port `5000` by default.
- **Fix A (Disable AirPlay Receiver)**: Open **System Settings** ➔ **General** ➔ **AirDrop & AirPlay**, and toggle off **AirPlay Receiver**.
- **Fix B (Change Port)**: Change `PORT=5001` in `server/.env` and update `VITE_API_URL=http://localhost:5001` in `client/.env`.

### 2. Common PostgreSQL Connection Errors
- **`P1001: Can't reach database server at localhost:5432`**:
  Ensure PostgreSQL is running on your machine. On Windows, check `services.msc` for the `postgresql-x64` service. On macOS/Linux, verify with `brew services list` or `sudo systemctl status postgresql`.
- **`P1000: Authentication failed against database server`**:
  Verify the password in `DATABASE_URL` matches your local `postgres` user password. If your password contains special characters (e.g. `@`, `:`, `/`, `?`), make sure they are properly URL-encoded.
- **`database "skillbridge" does not exist`**:
  You must create the database before running migrations. Run `psql -U postgres -c "CREATE DATABASE skillbridge;"` or create it via pgAdmin.

---

## 📄 License & Ownership

Copyright (c) 2026 Deekshitha C. All rights reserved. This repository is public for viewing and evaluation purposes only. Copying, modifying, or redistributing the code requires written permission.
