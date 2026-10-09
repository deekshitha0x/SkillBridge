# SkillBridge → RPL: Full Pivot Plan

> **Update note:** This version preserves the previous pivot plan and applies only the required corrections and improvements identified during review. Unnecessary product or architecture changes have not been added.

---

# 0. First Step — Repo Audit Before Implementation

Before changing code, the first implementation step should be a **file-by-file audit of the existing SkillBridge repository**.

The goal is to identify exactly what can be reused, repurposed, modified, or removed rather than rewriting working foundations unnecessarily.

The audit should produce a concrete change list covering at least:

```text
/client
  routes / pages
  components
  auth / role guards
  API helpers
  assessment / challenge components
  matching-related UI

/server
  routes
  middleware
  lib/matching.js
  lib/eligibility.js
  Prisma schema
  seed data

/shared or config
  environment/config assumptions
```

For each relevant file, classify it as:

- **KEEP** — use as-is where possible
- **REPURPOSE** — change its domain meaning but preserve its structure
- **MODIFY** — update logic/UI for RPL
- **REMOVE** — old hiring-domain functionality
- **NEW** — genuinely required RPL functionality

Do this audit **before deleting or rewriting old code**. The resulting file-by-file change list becomes the implementation checklist for the pivot.

---

## 1. The New Product

### New name / positioning

You can keep **SkillBridge** as the product name.

But its meaning changes from:

> **A platform where students prove skills for employment**

to:

> **An AI-assisted platform that helps informal workers demonstrate and get assessed for skills they already possess, enabling Recognition of Prior Learning.**

A good one-line positioning is:

> **SkillBridge RPL helps informal workers turn years of practical experience into structured, NSQF-aligned competency evidence for assessor-led certification.**

The fundamental philosophy of the old product actually survives:

> **Don't just tell us what you know. Prove what you can do.**

But now the person proving their skills is an **informal worker**, and the person validating them is an **RPL assessor**, not a recruiter.

The old product's core loop was essentially:

**Claim → Quiz → Challenge → Recruiter Verification → Verified Skill → Hiring**

The new loop should become:

**Self-Declare → QP/NOS Mapping → Assessment → Evidence → Rubric Scoring → AI Assistance → Assessor Sign-Off → Competency Profile → Certification Recommendation**

---

# 2. What We Should NOT Do

This is the most important strategic decision.

**Do not turn the existing application into:**

> "SkillBridge + an RPL page"

That would look like a repurposed hiring platform.

Instead, the **assessment workflow needs to become the center of the entire product.**

The old product had three major stakeholders:

- Student
- Recruiter
- Institution

The new product should have:

- **Worker**
- **Assessor**
- **Admin / Assessment Organization**

The institution/hiring ecosystem becomes secondary or disappears from the MVP.

---

# 3. Old → New Product Mapping

| Existing SkillBridge | RPL SkillBridge | Action |
|---|---|---|
| Student | Worker | Rename + modify |
| Student profile | Worker profile | Modify |
| Claim skill | Self-declare experience/skills | Repurpose |
| Verification quiz | Practical assessment | Replace |
| Claimed level 1–5 | Assessment scores / competency | Replace |
| Verified skill | Assessed competency | Repurpose |
| Skill Profile | NSQF competency profile | Major modification |
| Recruiter | Assessor | Repurpose role |
| Recruiter verification | Assessor evaluation/sign-off | Repurpose |
| Challenge | Practical assessment task | Repurpose heavily |
| Challenge rubric | Assessment rubric | Repurpose |
| Company | Assessment organization | Replace |
| Job | Assessment context | Remove/replace |
| Job requirements | QP/NOS criteria | Replace |
| Similar jobs | QP mapping | Replace |
| Job eligibility | Assessment eligibility | Replace |
| Hiring | Certification recommendation | Remove |
| Job application | Assessment assignment | Remove |
| Institution dashboard | Admin/assessment dashboard | Repurpose |
| Skill matching | QP/NOS mapping | Repurpose |
| Study resources | Assessment guidance | Optional |
| Hiring analytics | Assessment analytics | Replace |
| Skill renewal | Not MVP | Remove |
| Candidate filtering | Worker/assessment filtering | Modify |

---

# 4. Feature Disposition

## KEEP

These parts of the existing architecture are valuable:

### Authentication

Keep the existing authentication architecture.

The existing plan already has JWT authorization and role guards.

Keep the underlying mechanism but change the roles.

### Role-based routing

Definitely keep.

Instead of:

```text
Student
Recruiter
Institution
```

use:

```text
Worker
Assessor
Admin
```

### React + Vite

Keep.

There is no reason to rewrite the frontend framework.

### Tailwind / design system

Keep the existing visual foundation.

However, the visual language should become more:

- professional,
- trustworthy,
- assessment-oriented,
- accessible,
- mobile-friendly.

### Express + Prisma + PostgreSQL

Keep.

The existing backend architecture is perfectly suitable for the prototype.

### Assessment infrastructure

Keep the general concept of assessments, but substantially change its purpose.

### Challenge infrastructure

This is actually one of the most reusable parts.

A Challenge can become:

> **Practical Assessment Task**

### Existing matching module

Keep the **architectural seam**, but change what it matches.

Old:

```text
Job → Similar Jobs
```

New:

```text
Worker Declaration → Relevant QPs/NOS
```

The existing implementation plan already deliberately isolated matching into `server/src/lib/matching.js`, which makes this particularly useful to repurpose.

---

# 5. REMOVE

The following should disappear from the MVP:

### Hiring

Remove:

- job applications,
- hiring status,
- hired/rejected outcomes,
- interview pipeline,
- recruiter shortlisting,
- candidate hiring decisions.

### Job marketplace

Remove:

- Jobs page
- Job Detail
- similar jobs
- company discovery
- job requirements

### Company system

Remove the need for:

- Company
- Job
- JobSkill
- CompanyJob
- similar-company logic.

### Credits

Remove `CreditLog` and the idea of earning credits for verification.

### Student quiz

The old verification quiz was specifically designed to move a student from Pending → Claimed.

That concept no longer maps cleanly to RPL.

A worker shouldn't prove an electrician skill by answering a generic MCQ quiz.

Their competence should be assessed through **practical tasks and observable criteria**.

---

# 6. The New Core Architecture

The new architecture should look like this:

```text
                         SKILLBRIDGE RPL
                              │
             ┌────────────────┼────────────────┐
             │                │                │
          WORKER           ASSESSOR          ADMIN
             │                │                │
             ▼                ▼                ▼
      Self Declaration   Assessment Queue   QP/NOS Data
             │                │             Rubrics
             ▼                │             Assessors
       AI Mapping             │             Analytics
             │                │
             └───────┬────────┘
                     ▼
              RPL ASSESSMENT
                     │
         ┌───────────┼───────────┐
         ▼           ▼           ▼
      Tasks       Evidence     Rubrics
         │           │           │
         └───────────┼───────────┘
                     ▼
              AI ASSISTANCE
                     │
                     ▼
             ASSESSOR REVIEW
                     │
                     ▼
               SIGN-OFF
                     │
                     ▼
          COMPETENCY PROFILE
                     │
                     ▼
       CERTIFICATION RECOMMENDATION
```

---

# 7. The Worker Journey

This should become the primary demo.

## Step 1 — Worker Registration

Worker creates an account.

Collect only information actually needed.

Potential fields:

```text
Name
Phone
Location
Preferred language
Trade / occupation
Years of experience
Previous work experience
```

Do not carry over the old student-oriented Aadhaar simulation unless there is a compelling SIH demo reason.

For this prototype, identity verification can remain future scope unless the new PS explicitly requires it.

---

# 8. Step 2 — Self-Declaration

This is one of the most important new pages.

Example:

### "Tell us what you already know."

Worker selects:

**Trade: Electrician**

Then:

> How many years have you worked as an electrician?

> 8 years

Then tasks:

```text
✓ Domestic wiring
✓ Install switches
✓ Install sockets
✓ Circuit testing
✓ Fault identification
✓ Basic electrical safety
```

Then experience:

```text
Worked with local electrical contractor
2017–2025
```

Then optional evidence:

- photographs,
- previous work,
- employer details,
- apprenticeship information,
- documents.

---

# 9. Step 3 — AI QP/NOS Mapping

This becomes the new equivalent of the old `matching.js`.

The flow:

```text
Worker Declaration
        ↓
Extract skills/tasks
        ↓
Compare against QP/NOS dataset
        ↓
Rank relevant QPs
        ↓
Show relevance score
        ↓
Worker/Assessor sees recommendation
```

Example:

> **Recommended Qualification Pack**

**Electrician — QP Code: XXXX**

Relevance score:

**87**

Relevant areas:

- Domestic wiring
- Electrical installation
- Testing
- Safety procedures

Then:

> **Assessor confirmation required**

Buttons:

**Confirm Mapping**

**Choose Another QP**

This is critical because the AI should not silently decide the qualification.

---

# 10. QP/NOS Data Model

The central domain entities should become:

```text
QualificationPack
    │
    ├── NOS
    │     ├── PerformanceCriteria
    │     └── Tasks
    │
    └── NSQFLevel
```

Conceptually:

```text
Qualification Pack
      ↓
National Occupational Standards
      ↓
Performance Criteria
      ↓
Observable Competencies
      ↓
Assessment Tasks
      ↓
Rubric
```

### Important

Do **not** invent official QP/NOS information.

For the prototype, select **one trade** and load a small, properly sourced dataset.

The architecture should make it easy to add another trade later.

### QP dataset for the MVP

Do not treat a single QP record as enough to demonstrate meaningful mapping. Before implementing the mapping engine:

- download/use the **real QP, NOS and assessment-criteria documents** from the relevant Sector Skill Council / official source,
- load full assessment content for the selected MVP QP, and
- load basic metadata for approximately **4–6 real QPs** so the mapping engine has meaningful alternatives.

For the additional QPs, basic metadata is sufficient for the MVP:

```text
QP title
QP code
NSQF level
NOS names
keywords / occupation terms
```

The complete task, criterion and assessment structure only needs to be implemented for the selected MVP QP.

Do not invent official QP/NOS names, codes, levels, performance criteria or pass thresholds.

---

# 11. Which Trade?

I would recommend choosing **one trade with highly observable practical tasks**.

Good candidates include:

- Electrician
- Plumber
- Sewing Machine Operator

For the MVP, I'd lean toward **Electrician** because it gives you:

- clearly observable tasks,
- safety criteria,
- practical procedures,
- measurable outcomes,
- obvious assessment evidence,
- easy demo storytelling.

But the architecture should not hard-code "Electrician."

It should be:

```text
Trade
 ↓
QP
 ↓
NOS
 ↓
Assessment Template
```

So switching trades later becomes primarily a data problem rather than a software rewrite.

---

# 12. Step 4 — Assessment Assignment

Once mapping is confirmed:

```text
Worker
   ↓
QP
   ↓
Assessment Template
   ↓
Assessment Instance
```

The assessor sees:

> **Electrician — RPL Assessment**

Worker:

> Raj Kumar

Qualification:

> Electrician

Assessment status:

> Ready for Assessment

---

# 13. Practical Assessment

This becomes the heart of the application.

Instead of the old:

```text
Timed Quiz
↓
Score
```

we need:

```text
Practical Task
↓
Observe
↓
Capture Evidence
↓
Score Criteria
↓
Comments
```

Example:

## Task 1 — Install a domestic switch

**Instructions**

> Install a single-way switch according to the provided setup.

### Assessor observes:

| Criterion | Score |
|---|---:|
| Identifies correct tools | 2/2 |
| Follows safety procedure | 2/2 |
| Correct wire connection | 3/3 |
| Tests circuit correctly | 2/2 |
| Work quality | 2/3 |

Total:

**11 / 12**

---

# 14. Rubric Architecture

This is where the project can become significantly stronger than a normal CRUD SIH prototype.

Every criterion should have explicit descriptors.

Example:

### Criterion: Wire Connection

```text
0 — Unable to perform task

1 — Performs with significant assistance

2 — Performs independently with minor errors

3 — Performs correctly and consistently
```

The assessor doesn't just choose a number.

They see the meaning of the number.

This directly addresses:

> evaluator-to-evaluator variance.

---

# 15. Evidence

Every important criterion should be capable of being associated with evidence.

For example:

```text
Task
 ├── Criterion A
 │     └── Image
 ├── Criterion B
 │     └── Video
 └── Criterion C
       └── Assessor Observation
```

Evidence types:

```text
PHOTO
VIDEO
DOCUMENT
ASSESSOR_NOTE
```

The database should store metadata rather than blindly embedding files.

For example:

```text
Evidence
- id
- assessmentId
- taskId
- criterionId
- type
- fileUrl/localPath
- capturedAt
- uploadedAt
- syncStatus
```

---

# 16. AI Assistance

Don't attempt to make AI automatically "grade an electrician."

That is both technically risky and difficult to defend.

Instead, AI should assist the assessor.

## AI Feature 1 — QP Mapping

**High priority**

```text
Declaration → Relevant QP/NOS
```

## AI Feature 2 — Evidence Association Assistance

For the MVP, AI should operate on **assessor-entered observations/notes and the assessment criterion**, not directly interpret uploaded photos or videos.

For example:

> "The assessor observation appears relevant to Criterion 3."

Assessor confirms or ignores the suggestion.

The uploaded photo/video remains supporting evidence; it is not automatically graded by AI in the MVP.

## AI Feature 3 — Missing Evidence

AI could flag:

> "No evidence has been attached for safety procedure."

Assessor can ignore or act on it.

## AI Feature 4 — Scoring Assistance

AI should use the **assessor's recorded observations/notes plus the rubric descriptor** to suggest a score. It should not infer the score directly from the uploaded image/video unless a real vision model is implemented later and explicitly labeled.

AI could say:

> "Based on the assessor observation, the criterion appears consistent with 'Performs independently with minor errors.'"

Suggested score:

**2/3**

Then:

> Assessor decision required.

The assessor can select:

**Accept 2**

or

**Change to 1**

or

**Change to 3**

This is much more defensible than:

> "AI gave the worker 82%."

---

# 17. Human-in-the-Loop

This should be visually explicit.

Every AI suggestion should show something like:

> **AI-assisted suggestion**

and:

> **Final score determined by assessor**

The architecture should record:

```text
AI Suggested Score
Assessor Final Score
Assessor Override
Override Reason
Timestamp
```

This gives you an excellent SIH talking point:

> **AI accelerates and standardizes assessment; it does not certify the worker.**

---

# 18. Final Competency Profile

The competency profile should explicitly include the **NSQF level** associated with the confirmed Qualification Pack.

The old Skill Profile should be transformed.

The new profile should show:

# RPL Competency Profile

**Worker:** Raj Kumar

**Trade:** Electrician

**Qualification:** Electrician — QP XXXXX

**NSQF Level:** X

### Competency Results

| NOS / Competency | Result |
|---|---|
| Electrical installation | Competent |
| Wiring | Competent |
| Testing | Competent |
| Safety | Competent |

Then:

### Assessment Summary

```text
Tasks Completed       5/5
Criteria Assessed     24
Evidence Items        18
Assessor              Anil Sharma
```

Then:

### AI-Assisted Recommendation

> Worker demonstrates competency against the assessed criteria.

Then:

### Assessor Decision

**Recommended for certification**

**[Assessor Sign-Off]**

---

# 19. Certification Recommendation

The recommendation logic must be based on the **published assessment criteria for the selected QP/NOS**, not thresholds invented by SkillBridge.

The implementation should explicitly define how results roll up:

```text
Qualification Pack
        ↓
NSQF Level
        ↓
NOS
        ↓
Performance Criteria
        ↓
Assessment Task
        ↓
Assessment Criterion
        ↓
Rubric
        ↓
Evidence
        ↓
Score
        ↓
Competency Result
        ↓
Certification Recommendation
```

If the official assessment criteria specify safety-critical requirements, minimum criterion scores, NOS-level requirements, or other mandatory conditions, encode those rules directly. Otherwise, do not invent a universal pass percentage.

The final recommendation remains subject to assessor sign-off. SkillBridge should not claim to issue the official NCVET certificate itself.

Use the term:

> **Certification Recommendation**

Example:

```text
Assessment completed
        ↓
Competency meets required criteria
        ↓
Recommendation generated
        ↓
Assessor sign-off
        ↓
Ready for certification authority / assessment organization
```

This preserves the distinction between:

**assessment software**

and

**official certification authority.**

---

# 20. New Assessor Dashboard

The assessor dashboard replaces the recruiter dashboard.

Instead of:

```text
Jobs
Candidates
Submissions
```

show:

```text
Assigned Assessments
Pending Reviews
Today's Assessments
Completed Assessments
Evidence Awaiting Review
```

Example:

### Assigned Assessments

| Worker | Trade | Status |
|---|---|---|
| Raj Kumar | Electrician | In Progress |
| Suresh | Electrician | Awaiting Review |
| Anita | Electrician | Completed |

---

# 21. Assessor Assessment Screen

This should probably become the **most polished screen in the entire application**.

Layout:

```text
------------------------------------------------
Worker: Raj Kumar
Trade: Electrician
QP: XXXXX
------------------------------------------------

Assessment Progress
████████████░░ 4/5 Tasks

------------------------------------------------
Task 4: Circuit Testing

Instructions
[task instructions]

Evidence
[PHOTO]
[VIDEO]

------------------------------------------------
Assessment Criteria

✓ Safety procedure
   [2/2]

✓ Correct testing procedure
   [3/3]

⚠ Interpretation of result
   AI suggestion: 2/3

   Assessor final score:
   [ 2 ▼ ]

   Notes:
   [....................]

------------------------------------------------

[Previous Task]       [Save]       [Next Task]
```

This is the product's key differentiating interface.

---

# 22. Admin Dashboard

Replace the old institution dashboard.

The new dashboard should show:

### Assessment metrics

```text
Workers Assessed
Assessments Completed
Pending Assessments
Recommended for Certification
Not Yet Competent
```

### Assessor metrics

```text
Assessments per assessor
Average assessment time
Average score
Override rate
```

### Consistency

```text
Inter-Assessor Agreement
With rubric:     0.XX
Without rubric:  0.XX
```

---

# 23. Database Redesign

The new database should move toward:

```text
User
WorkerProfile
AssessorProfile
Organization

QualificationPack
NOS
PerformanceCriterion

WorkerDeclaration
DeclarationItem
Experience

QPMapping
MappingResult

Assessment
AssessmentTask
AssessmentCriterion

TestSet
EvidenceItem
AssessmentRun

Rubric
RubricItem

Evidence

Score
AISuggestion

CompetencyResult
CertificationRecommendation

AssessorSignOff

SyncRecord
AuditLog
```

---

# 24. Suggested Relationships

Conceptually:

```text
User
 ├── WorkerProfile
 └── AssessorProfile

WorkerProfile
 └── WorkerDeclaration
       └── DeclarationItem

QualificationPack
 └── NOS
      └── PerformanceCriterion

WorkerDeclaration
 └── QPMapping
       └── QualificationPack

Assessment
 ├── Worker
 ├── Assessor
 ├── QualificationPack
 └── AssessmentTask

AssessmentTask
 └── AssessmentCriterion
       └── RubricItem

AssessmentCriterion
 ├── Evidence
 ├── Score
 └── AISuggestion

TestSet
 └── EvidenceItem
       └── AssessmentRun
             ├── Assessor
             ├── Condition
             └── Criterion-level Scores

Assessment
 └── CompetencyResult
       └── CertificationRecommendation
```

---

# 25. What Happens to Existing Prisma Models

### `User`

**KEEP**

Modify role enum.

Old:

```text
STUDENT
RECRUITER
INSTITUTION
```

New:

```text
WORKER
ASSESSOR
ADMIN
```

Potentially:

```text
SUPER_ADMIN
```

if needed.

### `Institution`

**REPURPOSE / RENAME**

Could become:

```text
Organization
```

because the system may eventually support:

- assessment bodies,
- training partners,
- SSC-related organizations,
- assessment centers.

### `Skill`

**REMOVE / REPLACE**

A generic skill table is too weak for RPL.

Replace with:

```text
QualificationPack
NOS
PerformanceCriterion
Competency
```

### `StudentSkill`

**REMOVE**

Replace with:

```text
WorkerDeclaration
CompetencyResult
```

### `Assessment`

**KEEP + MAJOR REFACTOR**

It becomes one of the most important models.

### `Company`

**REMOVE**

### `Job`

**REMOVE**

### `Challenge`

**REPURPOSE**

Rename conceptually to:

```text
AssessmentTask
```

### `Submission`

**REPURPOSE**

Could become:

```text
Evidence
```

or an assessment submission entity.

### `CreditLog`

**REMOVE**

There is no reason to award credits for RPL competency.

---

# 26. API Redesign

New API domains:

```text
/auth

/workers
/workers/:id/declaration
/workers/:id/profile

/qualification-packs
/qualification-packs/:id
/nos

/mappings
/mappings/:id
/mappings/:id/confirm

/assessments
/assessments/:id
/assessments/:id/tasks

/evidence
/evidence/:id

/scores
/scores/:id

/ai/mapping
/ai/evidence
/ai/scoring

/recommendations
/recommendations/:id/signoff

/admin
/admin/assessors
/admin/workers
/admin/analytics
/admin/rubrics

/sync
```

---

# 27. New Frontend Routes

## Public

```text
/
/login
/register
```

## Worker

```text
/worker/dashboard
/worker/profile
/worker/declaration
/worker/mapping
/worker/assessment
/worker/assessment/:id
/worker/competency-profile
/worker/recommendation
```

## Assessor

```text
/assessor/dashboard
/assessor/assessments
/assessor/assessment/:id
/assessor/assessment/:id/evidence
/assessor/assessment/:id/scoring
/assessor/assessment/:id/signoff
```

## Admin

```text
/admin/dashboard
/admin/workers
/admin/assessors
/admin/qualification-packs
/admin/nos
/admin/rubrics
/admin/analytics
/admin/consistency
```

---

# 28. Existing Frontend Components

### Keep

```text
components/ui/*
```

These should mostly survive.

### Remove

```text
components/jobs/*
```

### Remove / repurpose

```text
components/skills/*
```

The SkillCard can potentially become:

```text
CompetencyCard
```

### Repurpose

```text
components/challenges/*
```

into:

```text
components/assessment/*
```

Potential components:

```text
AssessmentCard
AssessmentProgress
TaskChecklist
RubricScoring
EvidenceUploader
EvidenceViewer
AISuggestion
AssessorNotes
SignOffPanel
```

---

# 29. Existing Pages

### Landing

**KEEP + rewrite**

New hero:

> **Get recognized for the skills you already have.**

Then explain:

```text
Declare your experience
↓
Map your skills
↓
Complete practical assessment
↓
Build evidence
↓
Get assessor-backed competency recognition
```

### Login

**KEEP + modify**

Remove student/recruiter language.

### Student Dashboard

**REPLACE**

→ Worker Dashboard.

### Student Skills

**REPLACE**

→ Self Declaration / Competency Profile.

### Skill Assessment

**REPLACE**

→ Practical Assessment.

### Jobs

**REMOVE**

### Job Detail

**REMOVE**

### Challenge Detail

**REBUILD**

→ Practical Assessment Task.

### Recruiter Dashboard

**REPLACE**

→ Assessor Dashboard.

### New Job

**REMOVE**

### Candidates

**REMOVE**

### Submissions

**REPURPOSE**

→ Evidence Review.

### Institution Dashboard

**REPLACE**

→ Admin / Assessment Organization Dashboard.

---

# 30. Offline-First Architecture

The offline design should be decided early, even if the full offline implementation comes later. The core architecture remains:

```text
PWA / Service Worker
        ↓
IndexedDB
        ↓
Offline State + Sync Queue
        ↓
Backend Sync API
        ↓
PostgreSQL
```

### Required early decisions

- Every offline-created record uses a **client-generated UUID**.
- Sync endpoints are **idempotent**, so retries do not create duplicate records.
- An assessor downloads an **assessment package** before going offline. The package contains the worker, confirmed QP/NOS, tasks, criteria, rubrics and any required reference data.
- For the prototype, save uploaded media to **server disk via Multer** and store file metadata/path in PostgreSQL. Offline evidence is stored locally until it can be uploaded and synchronized.
- AI features are **online-only** for the MVP. If AI is unavailable offline, the assessor continues manually.

An early technical offline spike should verify that an assessment package can be cached, edited, queued and synchronized before the final offline UI is polished.

This should be **PWA-based**, not a separate native application for the SIH MVP.

For the prototype, use a client-side IndexedDB abstraction such as Dexie if it fits the existing project.

---

# 31. What Should Work Offline?

### Worker

- profile
- declaration
- mapped assessment information
- assessment instructions

### Assessor

Most importantly:

- assessment tasks,
- rubric,
- scoring,
- notes,
- evidence metadata,
- assessment progress.

### Evidence

Images should be cached locally.

Video should be handled carefully because of file size.

For the MVP:

> Allow offline capture and queue upload for later synchronization.

---

# 32. Sync Model

Use a queue-based sync model with client-generated IDs and idempotent writes.

Suggested `SyncRecord`:

```text
id
entityType
entityId
operation
payload
createdAt
syncStatus
retryCount
lastError
```

Suggested statuses:

```text
PENDING
SYNCING
SYNCED
FAILED
CONFLICT
```

The server should treat `(entityId, operation/version)` or an equivalent idempotency key as a safe retry boundary so reconnecting repeatedly does not duplicate assessment data.

When connectivity returns, the sync manager sends pending operations to the idempotent sync API.

The user should see:

> **Saved offline — will sync when connection returns.**

---

# 33. Conflict Strategy

Do not over-engineer this.

For an SIH MVP:

### Worker declaration

Latest server-confirmed version wins unless an assessor has already locked the assessment.

### Assessment scoring

Once an assessor starts final sign-off:

> assessment becomes locked.

This avoids complex simultaneous editing.

---

# 34. AI Architecture

Divide AI into three tiers.

## P0 — Must Have

### QP Mapping

Input:

```text
Worker declaration
```

Output:

```text
Top 3 relevant QPs
Relevant NOS
Relevance score
Reason
```

This is the strongest AI feature.

## P1 — Strong Enhancement

### Evidence-to-Criterion Assistance

For the MVP, the AI sees assessor-entered observations/notes and the criterion.

Input:

```text
Assessor observations / notes
+ criterion
```

Output:

```text
Relevant / Possibly Relevant / Not Relevant
```

Assessor confirms.

Do not imply that the AI is automatically judging photos/videos unless an actual vision model is implemented and explicitly labeled as such. Photos/videos remain evidence; the MVP's AI assistance can operate on structured assessor observations.

## P1 — Strong Enhancement

### AI Scoring Suggestion

Input:

```text
Assessor observations / notes
+ rubric descriptor
```

Output:

```text
Suggested score
Reason
```

The output is an AI suggestion, not a calibrated probability or objective grade. The assessor decides the final score.

## P1

### Competency Summary

After assessment:

> "The worker demonstrated competency in X, Y and Z. Further evidence/assistance was required for A."

This gives you a strong visible AI output during the demo.

---

# 35. AI Failure Handling

If AI isn't available:

```text
AI unavailable
       ↓
Continue manual assessment
```

The platform must never become unusable because an AI API fails.

That also makes the architecture more credible.

---

# 36. Inter-Assessor Consistency

This needs to be an actual feature, not just a PowerPoint claim.

### Test set

Create a recorded test set of practical assessment evidence using photos/videos of the same type of tasks the MVP assesses. Store the test-set metadata separately so the same evidence can be scored independently by multiple assessors.

The assessment/test schema should support:

```text
TestSet
  ↓
EvidenceItem
  ↓
AssessmentRun
  ├── assessorId
  ├── condition: manual | rubric-assisted
  └── independent criterion-level scores
```

The existing single-assessor `Assessment` model should not be reused as the only place to store this experiment, because the experiment requires multiple independent score sets for the same evidence.

### Experiment design

For a small team of approximately **5–6 assessors**, use one counterbalanced design. Prepare two comparable evidence sets, **Set A** and **Set B**. Each assessor scores both sets, but the condition order is swapped across assessors so that the same assessor does not score the same evidence in both conditions:

```text
Group 1:
  Set A → Manual
  Set B → Rubric-assisted

Group 2:
  Set A → Rubric-assisted
  Set B → Manual
```

This avoids the strongest memory/learning bias while keeping the experiment manageable. Record **per-criterion scores** independently for every run.

The experiment schema is defined during the database phase so the test can be populated and executed later without a schema retrofit.

### What to measure

The rubric scores are ordinal (for example 0–3), so do **not** treat them as nominal categories and report ordinary Fleiss' kappa as the primary statistic. Prefer:

- **weighted Cohen's kappa** for two assessors, or
- **Krippendorff's alpha** (ordinal) where appropriate for multiple assessors / missing scores.

For the SIH headline, also convert the official competency decision into:

```text
Competent
Not Yet Competent
```

and report the resulting **Competent / Not-Yet-Competent agreement**.

The dashboard can display something like:

```text
Manual assessment
Criterion-level agreement: X
Competent / Not-Yet-Competent agreement: Y

Rubric-assisted assessment
Criterion-level agreement: X
Competent / Not-Yet-Competent agreement: Y
```

where all values are calculated from the actual recorded test.

Be transparent that this is a **small internal pilot**, especially if the team members are not trained trade assessors. If possible, include at least one real electrician / ITI instructor or other domain expert to strengthen the test.

---

# 37. The Strong SIH Differentiator

Your strongest story is not:

> "We use AI to assess workers."

That invites difficult questions.

Your stronger story is:

> **"We use AI to make RPL assessment more structured, scalable and consistent while keeping the assessor in control."**

That's much more defensible.

---

# 38. MVP

Aggressively constrain the MVP to:

## One trade

Preferably:

**Electrician**

## One complete QP

With:

- relevant NOS,
- NSQF level,
- performance criteria,
- official assessment criteria,
- assessment tasks.

The mapping dataset may still contain metadata for **4–6 real QPs** so that the AI mapping stage has meaningful alternatives.

## One complete workflow

```text
Worker
 ↓
Self Declaration
 ↓
AI QP Mapping
 ↓
Assessor Confirmation
 ↓
Assessment
 ↓
3–5 Practical Tasks
 ↓
Evidence
 ↓
Rubric
 ↓
AI Assistance
 ↓
Assessor Scoring
 ↓
Competency Profile
 ↓
Recommendation
 ↓
Sign-Off
```

## Offline

At minimum:

- assessment form,
- scoring,
- notes,
- image capture,
- sync queue.

That is enough to demonstrate the requirement convincingly.

---

# 39. P0 / P1 / P2 Priorities

| Feature | Priority |
|---|---|
| Worker login | P0 |
| Worker profile | P0 |
| Self-declaration | P0 |
| QP/NOS dataset | P0 |
| AI QP mapping | P0 |
| Assessor dashboard | P0 |
| Assessment assignment | P0 |
| Practical tasks | P0 |
| Rubric | P0 |
| Evidence capture | P0 |
| Scoring | P0 |
| Competency profile | P0 |
| Certification recommendation | P0 |
| Assessor sign-off | P0 |
| Offline scoring | P0 |
| Sync | P0 |
| AI evidence assistance | P1 |
| AI score suggestion | P1 |
| Video analysis | P2 |
| Computer vision | P2 |
| Multi-trade support | P2 |
| Advanced analytics | P2 |
| Employer/job platform | P3 |

---

# 40. Recommended Build Order

### Phase 0 — Audit the existing repo

Produce the file-by-file KEEP / REPURPOSE / MODIFY / REMOVE / NEW change list before touching the implementation.

Also identify where the existing assessment, challenge, matching and role infrastructure can be reused.

### Phase 1 — Kill the old domain

Remove:

- jobs,
- companies,
- hiring,
- recruiter workflows,
- credits,
- student terminology.

Do **not** delete reusable components yet.

### Phase 2 — Change roles

Implement:

```text
WORKER
ASSESSOR
ADMIN
```

Update:

- JWT,
- role guards,
- routes,
- dashboard redirects.

### Phase 3 — Build RPL database

Before implementing the final schema, obtain the real QP/NOS/assessment-criteria documents for the selected trade and confirm the data hierarchy and official competency rules.

Implement:

```text
QP
NOS
PerformanceCriteria
Rubric
AssessmentTask
Assessment
Evidence
Score
CompetencyResult
Recommendation

TestSet
EvidenceItem
AssessmentRun
```

Use **client-compatible UUID primary keys** for domain records that may be created offline. This is a schema decision and should be established here, not retrofitted during the offline phase.

The consistency-test models should support:

```text
TestSet
  ↓
EvidenceItem
  ↓
AssessmentRun
  ├── assessorId
  ├── condition: manual | rubric-assisted
  └── independent criterion-level scores
```

### Phase 4 — Worker Declaration

Build:

```text
Worker Dashboard
      ↓
Self Declaration
      ↓
Experience
      ↓
Skills / Tasks
      ↓
Evidence
```

### Phase 5 — QP Mapping

Build the mapping engine.

Initially:

```text
Declaration
 ↓
TF-IDF / embeddings / similarity
 ↓
QP ranking
```

But the architecture should allow a stronger model later.

### Phase 6 — Assessor Workflow

Build:

```text
Dashboard
 ↓
Assigned Assessment
 ↓
Worker Declaration
 ↓
QP Review
 ↓
Assessment
```

### Phase 7 — Practical Assessment

Implement:

```text
Task
 ↓
Criteria
 ↓
Rubric
 ↓
Evidence
 ↓
Score
```

This is the core.

### Phase 7.5 — Early Offline Spike

Before continuing into the full AI and offline implementation, prove the basic offline path with a small technical spike:

```text
Download assessment package
        ↓
Disconnect internet
        ↓
Edit score / note
        ↓
Queue local change
        ↓
Reconnect
        ↓
Idempotent sync
```

This validates IndexedDB, client-generated UUIDs, assessment-package caching and sync behavior early, before the final offline UI is built.

### Phase 8 — AI Assistance

Add:

```text
QP Mapping
Evidence Suggestions
Score Suggestions
Summary
```

### Phase 9 — Competency Profile

Generate:

```text
Assessment Results
 ↓
Competency Profile
 ↓
Recommendation
```

### Phase 10 — Assessor Sign-Off

Implement:

```text
Review
 ↓
Confirm / Override
 ↓
Sign
 ↓
Lock
```

### Phase 11 — Offline

The offline schema decisions should already have been made earlier. Implement:

```text
PWA
IndexedDB
Assessment Package
Sync Queue
Idempotent Sync
Offline Evidence
```

Use the UUID primary-key design established in Phase 3 rather than changing the schema here.

AI remains online-only with manual fallback.

### Phase 12 — Consistency Experiment

Populate the recorded test set and run the counterbalanced manual vs rubric-assisted experiment using the `TestSet`, `EvidenceItem` and `AssessmentRun` schema defined in Phase 3.

Build the comparison mechanism and run the actual team test.

---

# 41. What the Final Demo Should Look Like

I'd make the SIH judges experience this:

### Scene 1 — Worker

> "I have worked as an electrician for 8 years, but I don't have formal certification."

Worker fills declaration.

### Scene 2 — AI

The system says:

> **We found a likely match with the Electrician Qualification Pack.**

It shows a **relevance score**, not a probability of correctness.

Shows:

```text
87 relevance score

Relevant NOS:
✓ Electrical installation
✓ Wiring
✓ Testing
✓ Safety
```

Assessor confirms.

### Scene 3 — Assessment

Assessor opens:

> **Task 2 — Domestic Switch Installation**

Worker performs it.

Evidence is captured.

### Scene 4 — Rubric

Assessor sees:

> Safety Procedure

```text
0 — Unable
1 — Needs significant assistance
2 — Minor errors
3 — Independent and correct
```

AI assistance:

> **Suggested: 2/3**

The suggestion is based on the assessor's recorded observations/notes and the rubric. It is not presented as automated visual grading.

Assessor:

> **Final: 2/3**

### Scene 5 — Offline

Turn off internet.

Capture evidence.

Score task.

System says:

> **Saved offline.**

Turn internet back on.

> **3 assessment items synchronized.**

### Scene 6 — Final Result

System generates:

> **NSQF-Aligned Competency Profile**

Then:

> **Certification Recommendation: Recommended**

Then:

> **Final decision: Assessor sign-off required**

Assessor signs.

### Scene 7 — Consistency

Show:

```text
Without structured rubric
Inter-assessor agreement: X

With SkillBridge RPL
Inter-assessor agreement: Y
```

where **X and Y are actual measurements from your team's test**.

That directly addresses one of the PS's expected outcomes.

---

# 42. The Final Product Should Feel Like This

Not:

> LinkedIn + quizzes + job portal.

Not:

> AI grading workers.

Not:

> A generic skill assessment website.

Instead:

> **An offline-capable RPL assessment workspace that converts informal experience into structured evidence, maps it to relevant QPs/NOS, guides practical assessment through standardized rubrics, uses AI to assist assessors, and produces an NSQF-aligned competency profile and certification recommendation.**

That is the product.

---

# 43. What Happens to the Existing SkillBridge Identity?

I would **keep the SkillBridge name and design system** rather than starting over.

The old product already has a strong conceptual identity around practical proof: the original central idea was that claimed skills should be demonstrated rather than merely asserted.

That's actually an excellent bridge into RPL.

You can reframe it:

### Old

> **Don't just tell us what you know. Prove what you can do.**

### New

> **You already have the skills. SkillBridge helps you prove them.**

And then:

> **From informal experience to recognized competency.**

That's a much cleaner SIH story.

---

# 44. Final Acceptance Criteria

I would consider the pivot successful only when all of these work:

### Worker

- [ ] Worker can register/login.
- [ ] Worker can complete prior-experience declaration.
- [ ] Worker can declare practical skills/tasks.
- [ ] Worker can see recommended QP.
- [ ] Worker can see assessment status.
- [ ] Worker can view final competency profile.

### Mapping

- [ ] QP data exists for one real trade from an official source.
- [ ] Basic metadata exists for 4–6 real QPs for mapping alternatives.
- [ ] NOS data is represented.
- [ ] Performance criteria are represented.
- [ ] AI produces relevant mapping suggestions.
- [ ] Assessor can confirm/change mapping.

### Assessment

- [ ] Assessor can assign assessment.
- [ ] Assessment has practical tasks.
- [ ] Tasks have standardized criteria.
- [ ] Criteria have scoring descriptors.
- [ ] Evidence can be attached.
- [ ] Assessor can score.
- [ ] Assessor can add notes.

### AI

- [ ] AI mapping works.
- [ ] AI assistance is clearly labeled.
- [ ] Assessor can override AI.
- [ ] AI failure doesn't stop assessment.

### Certification

- [ ] Competency results are generated.
- [ ] Recommendation is generated.
- [ ] Assessor can sign off.
- [ ] Assessment becomes immutable/locked after sign-off.

### Offline

- [ ] Core assessment UI loads offline.
- [ ] Assessment package can be downloaded before going offline.
- [ ] Offline-created records use client-generated UUIDs.
- [ ] Scores can be recorded offline.
- [ ] Notes can be recorded offline.
- [ ] Evidence can be captured offline.
- [ ] Sync is idempotent and occurs when connectivity returns.
- [ ] AI unavailability does not block manual assessment.

### Consistency

- [ ] Recorded test-set evidence exists.
- [ ] Multiple assessors can score the same evidence independently.
- [ ] Manual vs rubric-assisted conditions are stored explicitly.
- [ ] Criterion-level ordinal agreement can be calculated with an appropriate statistic.
- [ ] Competent / Not-Yet-Competent agreement can be calculated.
- [ ] Before/after rubric comparison can be demonstrated without memory-biased repeated scoring.

---

# The Most Important Architectural Decision

If I had to reduce the entire pivot to one sentence:

> **Take SkillBridge's existing authentication, UI, assessment, challenge, matching, and backend foundations, strip out the employment marketplace, and rebuild the domain layer around `Worker → Declaration → QP/NOS → Practical Assessment → Evidence → Rubric → AI Assistance → Assessor Sign-Off → Competency Profile`.**

That gives you a **genuine pivot** rather than a superficial repurpose, while still allowing you to reuse a large amount of the existing work.
