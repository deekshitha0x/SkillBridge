# SkillBridge — Full-Stack MVP Scaffold (SIH 2026)

SkillBridge is a skill-verification and hiring platform built for SIH 2026. It enables a proof-of-capability pipeline for three distinct user roles (**Student**, **Recruiter**, and **Institution**).

---

## 🚀 Core User Loop

```
Claim Skill ──► Take Assessment ──► Verified Skill Badge ──► Discover Job
                                                                  │
Level Advancement ◄── Recruiter Verifies ◄── Challenge-to-Hire ◄─┘
```

---

## 🛠️ Repository & Architecture Structure

```
/SkillBridge
├── /client (React + Vite + Tailwind CSS)
│   ├── /src
│   │   ├── /pages
│   │   │   ├── Landing.jsx            # Public landing page ("/", no auth required)
│   │   │   ├── Login.jsx              # OAuth / Demo Auth gateway + Simulated Aadhaar step
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
│   └── .env                           # VITE_API_URL=http://localhost:5000
│
└── /server (Node.js + Express.js + Prisma ORM)
    ├── /src
    │   ├── server.js                  # Main Express app (CORS configured for client)
    │   ├── /routes                    # auth, skills, assessments, jobs, challenges, profile, institution
    │   ├── /middleware                # requireAuth.js (JWT), requireRole.js (student/recruiter/institution)
    │   └── /lib                       # matching.js (rule-based matching), eligibility.js (skill prerequisite checker)
    ├── /prisma                        # schema.prisma, seed.js (PostgreSQL schema & mock data)
    └── .env                           # DATABASE_URL, JWT_SECRET, PORT=5000
```

---

## 📋 Prerequisites & Local Setup

### 1. PostgreSQL Database Initialization
Create a Postgres database named `skillbridge` on your local PostgreSQL server (Port 5432):
```bash
psql -U postgres -c "CREATE DATABASE skillbridge;"
```

### 2. Environment Variables Configuration

- **`/server/.env`**:
  ```env
  DATABASE_URL="postgresql://postgres:YOUR_PASSWORD@localhost:5432/skillbridge?schema=public"
  JWT_SECRET="skillbridge_hackathon_super_secret_jwt_key_2026"
  GOOGLE_CLIENT_ID="mock-google-client-id.apps.googleusercontent.com"
  GOOGLE_CLIENT_SECRET="mock-google-client-secret"
  PORT=5000
  ```

- **`/client/.env`**:
  ```env
  VITE_API_URL=http://localhost:5000
  ```

---

## ⚡ Running Migrations & Seeding

Navigate to `/server` and run the database setup:
```bash
cd server
npm install
npx prisma migrate dev --name init
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
npm run dev
```

Visit **`http://localhost:5173/`** in your browser.

---

## 🔑 Demo Login Accounts

You can test all 3 roles instantly from `/login` using the zero-friction demo buttons:

1. **Student**: Log in as *Alex Chen* (Claim skills, attempt proctored quizzes, check job prerequisites, submit challenge solutions).
2. **Recruiter**: Log in as *TechCorp Recruiter* (Post new jobs/challenges, review code solutions, approve & verify skill levels in single Prisma transactions).
3. **Institution**: Log in as *NIT Dean* (View campus aggregate skill distributions, level 2+ proficiency matrix, and student leaderboards).

---

## 🧩 Architectural Highlights & Future Seams

- **Anti-Cheat Monitoring**: Assessment quizzes track completion duration and log tab focus switch events (`visibilitychange`) stored on the submission.
- **Rule-Based Matching Module**: `server/src/lib/matching.js` exports `getSimilarJobs(jobId)` ranking job overlap based on skill intersections. This module is isolated so it can be swapped for a Python/scikit-learn microservice in a future phase without altering API callers.
- **Atomic Transactions**: Recruiter reviews execute inside a single `prisma.$transaction()` to atomically update `StudentSkill` levels.
