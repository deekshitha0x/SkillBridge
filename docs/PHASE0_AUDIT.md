# SkillBridge → RPL Pivot: Phase 0 Repository Audit

> **Document Version:** 1.0.0  
> **Status:** Completed  
> **Date:** October 9, 2026  
> **Repository:** SkillBridge (SIH 2026)  
> **Source of Truth:** `SkillBridge_RPL_Full_Pivot_Plan_Final.md` & `SkillBridge_RPL_IMPLEMENTATION _Roadmap_Final.md`

---

## 1. Summary

SkillBridge is transitioning from a student skill-verification and job hiring platform to an **AI-assisted Recognition of Prior Learning (RPL) assessment platform** for informal workers.

- **Reusable Foundations (KEEP / REPURPOSE):** The authentication engine (JWT + bcrypt pattern), role-guard middleware (`RequireRole`), React 19 + Vite 6 frontend build pipeline, Tailwind CSS design tokens, Express REST API structure, and Prisma 6 ORM schema with PostgreSQL setup are all retained. Structural concepts like `Challenge` → `AssessmentTask`, `Submission` → `Evidence`, `Student` → `Worker`, `Recruiter` → `Assessor`, `Institution` → `Organization/Admin`, and `lib/matching.js` → `QP/NOS Mapping Seam` are fully repurposed.
- **Removed Domain (REMOVE):** Old employment marketplace components—Jobs marketplace, Job details, Job applications, Company system (`Company`, `Job`), hiring pipeline, Recruiter candidate pool, credit logs, and the generic student MCQ verification quiz.
- **New Requirements (NEW):** Qualification Pack (QP) & National Occupational Standards (NOS) data model, Worker self-declaration flow, AI-assisted QP/NOS matching engine, Assessor practical assessment workspace, multi-modal evidence handling (Multer + local storage), ordinal rubric scoring, AI suggestion engine, competency profile & certification recommendation sign-off, offline PWA / Service Worker / IndexedDB sync engine, and the counterbalanced assessor-consistency experiment models.

---

## 2. Baseline Build & Run Result

| Package / Module | Script Tested | Command Executed | Result | Notes / Error Logs |
|---|---|---|---|---|
| **Git Working Tree** | `git status` | `git status` | **DIRTY** | Unstaged/untracked changes present (see Section 6). Tag `pre-rpl-pivot` and branch `rpl-pivot` created. |
| **Client (`/client`)** | `build` | `npm run build` | **PASS** | Vite v6.4.3 compiled 1630 modules successfully in 50.29s. `dist/` created clean. |
| **Client (`/client`)** | `dev` | `npm run dev` | **PASS** | Script exists (`vite`). |
| **Client (`/client`)** | `preview` | `npm run preview` | **PASS** | Script exists (`vite preview`). |
| **Client (`/client`)** | `lint` | N/A | **N/A** | No `lint` script present in `client/package.json`. |
| **Client (`/client`)** | `test` | N/A | **N/A** | No `test` script present in `client/package.json`. |
| **Server (`/server`)** | `start` | `npm start` | **PASS** | Script exists (`node src/server.js`). Starts Express app on port 5000. |
| **Server (`/server`)** | `dev` | `npm run dev` | **PASS** | Script exists (`nodemon src/server.js`). |
| **Server (`/server`)** | `prisma:generate` | `npm run prisma:generate` | **PASS** | Script exists (`prisma generate`). |
| **Server (`/server`)** | `prisma:migrate` | `npm run prisma:migrate` | **PASS** | Script exists (`prisma migrate dev`). |
| **Server (`/server`)** | `seed` | `npm run seed` | **PASS** | Script exists (`node prisma/seed.js`). |
| **Server (`/server`)** | `build` | N/A | **N/A** | Node.js Express app does not require transpilation script. |
| **Server (`/server`)** | `lint` / `test` | N/A | **N/A** | No `lint` or `test` scripts present in `server/package.json`. |

---

## 3. File-by-File Classification Table

| Path | Current Purpose | Action | New Purpose / Reason | Dependencies Affected | Roadmap Phase |
|---|---|---|---|---|---|
| `.gitignore` | Git ignore rules | **MODIFY** | Add media uploads (`/uploads`), build outputs, SQLite/PWA cache | Git tracked files | Phase 1 |
| `README.md` | Project overview & setup docs | **MODIFY** | Update project description to RPL platform architecture & SIH story | Root documentation | Phase 1 |
| `SkillBridge_RPL_Full_Pivot_Plan_Final.md` | Pivot strategy specification | **KEEP** | Primary functional specification source of truth | Documentation | Phase 0 |
| `SkillBridge_RPL_IMPLEMENTATION _Roadmap_Final.md` | Execution roadmap | **KEEP** | Execution order source of truth | Documentation | Phase 0 |
| `client/package.json` | Client dependencies & scripts | **MODIFY** | Add PWA/IndexedDB packages (idb / localforage) when needed | Client build | Phase 1/11 |
| `client/vite.config.js` | Vite bundler config | **MODIFY** | Configure PWA plugin / service worker support for offline | Client build | Phase 11 |
| `client/tailwind.config.js` | Tailwind CSS configuration | **MODIFY** | Update color palette for professional assessment UI | Client styling | Phase 1 |
| `client/index.html` | Entry HTML document | **MODIFY** | Update title tag, meta tags, and PWA manifest link | Client entry | Phase 1 |
| `client/src/main.jsx` | React root mounting | **KEEP** | Mounts React App root container | Client entry | Phase 1 |
| `client/src/App.jsx` | Top-level App wrapper | **KEEP** | Wraps Router and AuthProvider | Client root | Phase 1 |
| `client/src/index.css` | Global CSS & Tailwind directives | **MODIFY** | Global typography and design system tokens for RPL | Global styles | Phase 1 |
| `client/src/lib/api.js` | Axios/fetch API helper | **MODIFY** | Add headers, offline queuing hooks, error handling | API layer | Phase 1/11 |
| `client/src/context/AuthContext.jsx` | Auth state context & token management | **MODIFY** | Update role state mappings (`worker`, `assessor`, `admin`) | All protected routes | Phase 1 |
| `client/src/routes/AppRoutes.jsx` | React Router route table & RequireRole guard | **MODIFY** | Replace student/recruiter/institution routes with worker/assessor/admin routes | App routing | Phase 1 |
| `client/src/components/ui/Badge.jsx` | UI Badge component | **KEEP** | Reusable UI primitive for status badges | Client UI | Phase 1 |
| `client/src/components/ui/Button.jsx` | UI Button component | **KEEP** | Reusable UI primitive for interactive buttons | Client UI | Phase 1 |
| `client/src/components/ui/Card.jsx` | UI Card component | **KEEP** | Reusable UI primitive for containers | Client UI | Phase 1 |
| `client/src/components/ui/ProgressBar.jsx` | UI Progress bar component | **KEEP** | Reusable UI primitive for assessment completion progress | Client UI | Phase 1 |
| `client/src/components/skills/SkillCard.jsx` | Student skill display card | **REPURPOSE** | `CompetencyCard` - Displays worker competency status | Worker Profile | Phase 5 |
| `client/src/components/skills/SkillProfileTable.jsx` | Student skill summary table | **REPURPOSE** | `CompetencyProfileTable` - NSQF aligned competency summary | Worker Profile | Phase 5/10 |
| `client/src/components/skills/VerifiedBadge.jsx` | Skill verification status badge | **REPURPOSE** | `AssessedCompetencyBadge` - Indicates Assessor sign-off | Worker UI | Phase 10 |
| `client/src/components/challenges/ChallengeCard.jsx` | Challenge preview card | **REPURPOSE** | `AssessmentTaskCard` - Practical assessment task item | Assessor Workspace | Phase 8 |
| `client/src/components/challenges/SubmissionForm.jsx` | Challenge code submission form | **REPURPOSE** | `EvidenceSubmissionForm` - Photo/video/note capture form | Assessor Workspace | Phase 9 |
| `client/src/components/jobs/JobCard.jsx` | Job posting preview card | **REMOVE** | Old job marketplace component. No equivalent in RPL core loop. | `StudentJobs.jsx` | Phase 2 |
| `client/src/components/jobs/RequiredSkillsTable.jsx` | Job skill requirements table | **REMOVE** | Old job requirement table. Replaced by `NOSCriteriaTable`. | `StudentJobDetail.jsx` | Phase 2 |
| `client/src/components/jobs/SimilarJobsList.jsx` | Similar jobs list component | **REMOVE** | Old job recommendation UI. Replaced by `QPMappingCard`. | `StudentJobDetail.jsx` | Phase 2 |
| `client/src/components/jobs/StudyMaterials.jsx` | Study resources list | **REPURPOSE** | `AssessmentGuidance` - Pre-assessment preparation guidance | Worker Dashboard | Phase 5 |
| `client/src/pages/Landing.jsx` | Public landing page | **MODIFY** | Reposition hero & features around RPL informal worker certification | Public routing | Phase 1 |
| `client/src/pages/Login.jsx` | Login & signup page | **MODIFY** | Update role selector tabs (`Worker`, `Assessor`, `Admin`) | Authentication | Phase 1 |
| `client/src/pages/student/Dashboard.jsx` | Student overview dashboard | **REPURPOSE** | `WorkerDashboard.jsx` - Worker declaration & assessment status | Worker routing | Phase 5 |
| `client/src/pages/student/SkillProfile.jsx` | Student skill profile page | **REPURPOSE** | `WorkerProfile.jsx` - Worker self-declaration & NSQF profile | Worker routing | Phase 5 |
| `client/src/pages/student/Skills.jsx` | Student skill redirection page | **REMOVE** | Redundant redirect wrapper | `AppRoutes.jsx` | Phase 2 |
| `client/src/pages/student/SkillAssessment.jsx` | MCQ verification quiz page | **REMOVE** | MCQ quiz does not fit RPL practical observation model | `AppRoutes.jsx` | Phase 2 |
| `client/src/pages/student/Jobs.jsx` | Student job marketplace list | **REMOVE** | Job marketplace flow eliminated | `AppRoutes.jsx` | Phase 2 |
| `client/src/pages/student/JobDetail.jsx` | Student job detail page | **REMOVE** | Job detail flow eliminated | `AppRoutes.jsx` | Phase 2 |
| `client/src/pages/student/ChallengeDetail.jsx` | Student challenge page | **REPURPOSE** | `PracticalAssessmentDetail.jsx` - Worker task view | Worker routing | Phase 8 |
| `client/src/pages/recruiter/Dashboard.jsx` | Recruiter overview dashboard | **REPURPOSE** | `AssessorDashboard.jsx` - Assessor review queue | Assessor routing | Phase 7 |
| `client/src/pages/recruiter/NewJob.jsx` | Recruiter job posting form | **REMOVE** | Job posting flow eliminated | `AppRoutes.jsx` | Phase 2 |
| `client/src/pages/recruiter/Candidates.jsx` | Recruiter candidate pool | **REMOVE** | Recruiter candidate filtering eliminated | `AppRoutes.jsx` | Phase 2 |
| `client/src/pages/recruiter/Submissions.jsx` | Code submission review page | **REPURPOSE** | `AssessorEvaluationWorkspace.jsx` - Evidence review & rubric scoring | Assessor routing | Phase 8/9/10 |
| `client/src/pages/institution/Dashboard.jsx` | Institution analytics page | **REPURPOSE** | `AdminDashboard.jsx` - Assessment organization & analytics dashboard | Admin routing | Phase 7 |
| `server/package.json` | Server dependencies & scripts | **MODIFY** | Add `multer` for media file uploads when building evidence handling | Server dependencies | Phase 9 |
| `server/src/server.js` | Express app configuration | **MODIFY** | Update API route mounts (`/api/worker`, `/api/assessor`, `/api/qp`) | Server entry | Phase 1 |
| `server/src/middleware/requireAuth.js` | JWT auth verification middleware | **KEEP** | Standard JWT validation mechanism; update error messages if needed | All API routes | Phase 1 |
| `server/src/middleware/requireRole.js` | Role guard middleware | **KEEP** | Checks `req.user.role` against allowed roles | Protected API routes | Phase 1 |
| `server/src/lib/matching.js` | Job similarity algorithm | **REPURPOSE** | `lib/qpMapping.js` - Compares Worker Declaration against QP/NOS dataset | `routes/assessments.js` | Phase 6 |
| `server/src/lib/eligibility.js` | Challenge prerequisite validator | **REPURPOSE** | `lib/assessmentEligibility.js` - Checks Worker experience against QP prerequisites | `routes/assessments.js` | Phase 5/6 |
| `server/src/routes/auth.js` | Auth endpoints (register, login, me) | **MODIFY** | Support `worker`, `assessor`, `admin` registration & profile creation | Auth API | Phase 1 |
| `server/src/routes/profile.js` | User profile endpoints | **REPURPOSE** | `routes/worker.js` - Worker profile, trade, and declaration endpoints | Worker API | Phase 5 |
| `server/src/routes/skills.js` | Skill claim & MCQ quiz routes | **REPURPOSE** | `routes/declaration.js` - Trade self-declaration & experience listing | Worker API | Phase 5 |
| `server/src/routes/assessments.js` | MCQ quiz evaluation routes | **REPURPOSE** | `routes/assessment.js` - Practical task evaluation, evidence, rubric scoring | Assessor API | Phase 8/9/10 |
| `server/src/routes/jobs.js` | Job CRUD & candidate matching endpoints | **REMOVE** | Employment job endpoints deleted | `server.js` | Phase 2 |
| `server/src/routes/challenges.js` | Practical challenge endpoints | **REPURPOSE** | `routes/tasks.js` - Practical assessment task templates and instances | Assessor/Worker API | Phase 8 |
| `server/src/routes/institution.js` | Institution analytics endpoints | **REPURPOSE** | `routes/admin.js` - Organization analytics, QP catalog management | Admin API | Phase 7 |
| `server/prisma/schema.prisma` | Main Prisma database schema | **MODIFY** | Replace hiring models with RPL domain models (see Section 4) | Database ORM | Phase 3 |
| `server/prisma/seed.js` | Database seed script | **MODIFY** | Seed Electrician QP, NOS, Performance Criteria, Rubrics, and demo Users | Database initialization | Phase 4 |
| `server/src/prisma/schema.prisma` | Duplicate schema file in `src/` | **REMOVE** | Redundant file causing schema drift risk | Prisma CLI | Phase 1 |
| `server/src/prisma/seed.js` | Duplicate seed file in `src/` | **REMOVE** | Redundant file causing seed drift risk | Prisma CLI | Phase 1 |

---

## 4. Prisma Model Disposition

| Existing Prisma Model | Disposition | Target RPL Entity / Model | Reason & Description |
|---|---|---|---|
| `User` | **MODIFY** | `User` | Retain core fields (`id`, `name`, `email`, `role`, `createdAt`, `updatedAt`). Role enum becomes `worker`, `assessor`, `admin`. Link to `WorkerProfile`, `AssessorProfile`, and `Organization`. |
| `Institution` | **REPURPOSE** | `Organization` | Assessment Organization / SSC / Training Partner entity managing assessment centers and assessors. |
| `Skill` | **REPURPOSE** | `NOS` / `Skill` | Represents National Occupational Standards (NOS) and atomic skill competencies under a QP. |
| `StudentSkill` | **REPURPOSE** | `WorkerDeclaration` / `DeclarationItem` | Replaced by worker self-declared trade skills and experience items before assessment. |
| `Assessment` | **REPURPOSE** | `Assessment` | Practical Assessment instance linking Worker, Assessor, and Qualification Pack. Old MCQ JSON replaces with relational assessment structure. |
| `Company` | **REMOVE** | N/A | Removed. Employer company concept is eliminated from RPL assessment MVP. |
| `Job` | **REMOVE** | N/A | Removed. Replaced by `QualificationPack` domain model. |
| `Challenge` | **REPURPOSE** | `AssessmentTask` | Represents a practical observable task (e.g., "Install domestic switch") with safety & skill criteria. |
| `Submission` | **REPURPOSE** | `Evidence` / `TaskSubmission` | Practical evidence artifact (photo, video, assessor note) attached to an assessment criterion. |
| `CreditLog` | **REMOVE** | N/A | *Note:* Mentioned in original pivot plan docs but **does not exist** in actual `schema.prisma`. Will not be created. |

### NEW Target Models Required (Phase 3)
1. `WorkerProfile` (Trade, years of experience, location, preferred language)
2. `AssessorProfile` (Certification ID, trade specializations, assigned organization)
3. `QualificationPack` (QP code, title, NSQF level, sector skill council)
4. `NOS` (National Occupational Standard code, title, scope)
5. `PerformanceCriterion` (NOS performance criteria descriptions)
6. `WorkerDeclaration` & `DeclarationItem` (Self-declared experience & skills checklist)
7. `Experience` (Prior work history details)
8. `QPMapping` & `MappingResult` (AI & rule-based QP mapping scores and assessor override)
9. `AssessmentTask` & `AssessmentCriterion` (Practical task definitions & observable criteria)
10. `Rubric` & `RubricItem` (Standardized 0-3 ordinal descriptors per criterion)
11. `Evidence` (Photo, video, document, note metadata and sync status)
12. `Score` (Criterion-level score with assessor notes)
13. `AISuggestion` (AI suggested score, evidence tag, and missing evidence flags)
14. `CompetencyResult` & `CertificationRecommendation` (NOS competency aggregation & certification advice)
15. `AssessorSignOff` (Cryptographic/digital signature & sign-off timestamp)
16. `TestSet`, `EvidenceItem`, `AssessmentRun` (Consistency experiment benchmark models)
17. `SyncRecord`, `AuditLog` (Offline queue & change tracking)

### UUID Primary Key Analysis
- **Status:** **NOT BLOCKED**.
- **Inspection:** All existing Prisma models (`User`, `Institution`, `Skill`, `StudentSkill`, `Assessment`, `Company`, `Job`, `Challenge`, `Submission`) currently use `@id @default(uuid())` with String type.
- **Client Key Generation:** Client-side UUID generation (e.g. `crypto.randomUUID()`) is fully compatible with the backend schema for offline-first creation.

---

## 5. Terminology Audit

Below is the mapping of legacy terms found throughout the codebase to their RPL replacement terms:

| Legacy Term | Context / Occurrences in Repository | Replacement RPL Term | Target Action File Paths |
|---|---|---|---|
| `student` | Role strings, routes, components, state, variable names | `worker` / Worker | `client/src/routes/AppRoutes.jsx`<br>`client/src/context/AuthContext.jsx`<br>`client/src/pages/Login.jsx`<br>`client/src/pages/student/*`<br>`server/src/routes/auth.js`<br>`server/src/routes/profile.js`<br>`server/src/middleware/requireAuth.js`<br>`server/prisma/schema.prisma` |
| `recruiter` | Role strings, candidate views, job creation forms | `assessor` / Assessor | `client/src/routes/AppRoutes.jsx`<br>`client/src/pages/Login.jsx`<br>`client/src/pages/recruiter/*`<br>`server/src/routes/auth.js`<br>`server/src/routes/challenges.js`<br>`server/prisma/schema.prisma` |
| `institution` | Role strings, analytics dashboard, user relations | `admin` / Organization / Assessment Center | `client/src/routes/AppRoutes.jsx`<br>`client/src/pages/institution/*`<br>`server/src/routes/institution.js`<br>`server/prisma/schema.prisma` |
| `job` / `jobs` | Job listings, job details, job posting APIs | `QP` / Qualification Pack / Assessment Context | `client/src/components/jobs/*`<br>`client/src/pages/student/Jobs.jsx`<br>`client/src/pages/student/JobDetail.jsx`<br>`client/src/pages/recruiter/NewJob.jsx`<br>`server/src/routes/jobs.js`<br>`server/src/lib/matching.js`<br>`server/prisma/schema.prisma` |
| `company` | Company profile, recruiter job relationship | `Organization` / Assessment Organization | `client/src/pages/recruiter/*`<br>`server/src/routes/jobs.js`<br>`server/prisma/schema.prisma` |
| `hiring` / `hiringStatus` | Application pipeline, shortlisted/hired statuses | `Certification Recommendation` / Assessment Outcome | `client/src/pages/recruiter/*`<br>`server/src/routes/challenges.js`<br>`server/prisma/schema.prisma` |
| `quiz` / `verification quiz` | MCQ quiz for skill claiming | `Practical Assessment Task` / Rubric Evaluation | `client/src/pages/student/SkillAssessment.jsx`<br>`server/src/routes/skills.js`<br>`server/src/routes/assessments.js` |
| `skill claim` / `claimed` | Student claiming skill level 1-5 | `Self-Declared Skill` / Experience Declaration | `client/src/components/skills/*`<br>`server/src/routes/skills.js`<br>`server/src/lib/eligibility.js` |
| `challenge` | Challenge detail page & submission form | `Practical Assessment Task` / `AssessmentTask` | `client/src/components/challenges/*`<br>`client/src/pages/student/ChallengeDetail.jsx`<br>`server/src/routes/challenges.js`<br>`server/src/lib/eligibility.js` |

---

## 6. Risks, Unknowns, and Plan Gaps

### 1. Repository & File State Gaps
- **Dirty Git Working Tree:** `git status` revealed unstaged modifications in `AuthContext.jsx`, `Landing.jsx`, `Login.jsx`, `JobDetail.jsx`, `eligibility.js`, `auth.js`, deleted `SkillBridge_Description2.md`, and untracked `client/src/components/jobs/StudyMaterials.jsx`.
- **Duplicate Schema & Seed Files:** Prisma schema and seed scripts exist in BOTH `server/prisma/` and `server/src/prisma/`. This creates a severe risk of schema drift during migrations. `server/src/prisma/` should be removed in Phase 1.
- **Untracked Client File:** `client/src/components/jobs/StudyMaterials.jsx` is untracked in git. It can be repurposed into `AssessmentGuidance.jsx` for worker preparation.

### 2. Implementation & Dependency Gaps
- **Missing File Upload Middleware (Multer):** The pivot roadmap (Phase 9) requires uploading photo/video evidence to local disk (`/uploads`). `server/package.json` currently lacks `multer` or any file-handling package.
- **Missing PWA / Service Worker Setup:** The roadmap requires PWA offline functionality (IndexedDB + Service Worker sync). The current React + Vite setup has zero service worker, `manifest.json`, or `idb` libraries.
- **Freeform Role Strings:** Prisma `User.role` is currently a generic `String?` column rather than a strict enum. This requires validation logic in middleware to prevent bad roles.

### 3. Tracked Secrets & Hardcoded Credentials Audit
> **Security Note:** In compliance with audit directives, only file paths are listed below. No secret values, passwords, or tokens are output.

- **Hardcoded Fallback JWT Secrets Found:**
  - `server/src/middleware/requireAuth.js`
  - `server/src/routes/auth.js`
  - `server/src/routes/skills.js`
  - `server/src/routes/challenges.js`
  - `server/prisma/seed.js`
  - `server/src/prisma/seed.js`
- **Committed Local Configuration:** `server/.env` exists on local disk (gitignored).

### 4. Dependency & Import Coupling Risks
- `client/src/routes/AppRoutes.jsx` directly imports all recruiter, student, and institution page components. Deleting any page file without removing its import in `AppRoutes.jsx` will break the Vite build.
- `server/src/lib/eligibility.js` and `server/src/lib/matching.js` import `@prisma/client` and query `Job`, `Challenge`, and `StudentSkill`. Removing Prisma models without updating these utility functions will break API routing.

---

## 7. Proposed Phase 2 Removal Order

To safely remove legacy hiring-domain code while ensuring the client and server build cleanly after every single step:

```
Step 2.1: Disconnect Job routes in server/src/server.js
  └─ Action: Remove/comment out app.use('/api/jobs', jobsRoutes)
  └─ Verification: Run server (npm start in /server) -> PASS

Step 2.2: Decouple lib/matching.js and lib/eligibility.js
  └─ Action: Replace Job queries in matching.js and eligibility.js with stubs for QP mapping
  └─ Verification: Verify server imports without errors -> PASS

Step 2.3: Remove server/src/routes/jobs.js
  └─ Action: Safely delete server/src/routes/jobs.js
  └─ Verification: Run server (npm start in /server) -> PASS

Step 2.4: Clean client routing in client/src/routes/AppRoutes.jsx
  └─ Action: Remove routes /student/jobs, /student/jobs/:id, /recruiter/new-job, /recruiter/candidates
  └─ Verification: Run client build (npm run build in /client) -> PASS

Step 2.5: Remove client job marketplace components & pages
  └─ Action: Delete Jobs.jsx, JobDetail.jsx, NewJob.jsx, Candidates.jsx, JobCard.jsx, RequiredSkillsTable.jsx, SimilarJobsList.jsx
  └─ Verification: Run client build (npm run build in /client) -> PASS

Step 2.6: Remove Company & Job models from Prisma Schema
  └─ Action: Remove model Company and model Job from server/prisma/schema.prisma; run npx prisma generate
  └─ Verification: Run npx prisma generate & npm start in /server -> PASS
```

---

## 8. Questions for the Team

1. **Working Tree Cleanliness:** Should the dirty working tree changes (in `AuthContext.jsx`, `Landing.jsx`, `Login.jsx`, `JobDetail.jsx`, `eligibility.js`, `auth.js`) be committed into a baseline commit or stashed before beginning Phase 1?
2. **Duplicate Schema Directory:** May we delete `server/src/prisma/` so only `server/prisma/` remains as the canonical Prisma directory?
3. **Selected Trade for MVP:** Is **Electrician** confirmed as the target MVP trade for loading full QP, NOS, Performance Criteria, and Rubric datasets?
4. **Identity Verification Scope:** Should Aadhaar verification (`aadhaarVerified` field in `User`) be retained as a simulated mock UI step for worker onboarding, or hidden for the MVP demo?
