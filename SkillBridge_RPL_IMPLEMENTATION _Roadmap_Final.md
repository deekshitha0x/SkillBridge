# SkillBridge RPL — Implementation & Architecture Roadmap

> **Source of truth:** `SkillBridge_RPL_Full_Pivot_Plan_Final.md`
>
> This roadmap is derived from the final reviewed pivot plan. It is an execution document, not a replacement for the detailed pivot plan. It deliberately preserves the final plan's decisions around AI, QP/NOS data, offline operation, media storage, UUIDs, and the counterbalanced assessor-consistency experiment.

---

# 1. Purpose

This document answers one practical question:

> **How do we turn the final SkillBridge RPL pivot into a working product, step by step, without rebuilding the repository unnecessarily?**

The implementation strategy is:

```text
Final Repo Audit
      ↓
Domain Pivot
      ↓
RPL Data Foundation
      ↓
Worker Declaration
      ↓
QP/NOS Mapping
      ↓
Assessor Workflow
      ↓
Practical Assessment
      ↓
Evidence + Rubrics
      ↓
AI Assistance
      ↓
Competency + Recommendation
      ↓
Assessor Sign-Off
      ↓
Offline Spike
      ↓
Full Offline
      ↓
Consistency Experiment
      ↓
Stabilization
      ↓
Multi-Trade Expansion
      ↓
Advanced AI / Scale
```

---

# 2. Product Architecture

The central product loop is:

```text
Worker
  ↓
Self Declaration
  ↓
QP / NOS Mapping
  ↓
Assessor Confirmation
  ↓
Assessment
  ↓
Practical Tasks
  ↓
Evidence
  ↓
Rubric Scoring
  ↓
AI Assistance
  ↓
Assessor Decision
  ↓
Competency Result
  ↓
Certification Recommendation
  ↓
Assessor Sign-Off
  ↓
NSQF-Aligned Competency Profile
```

The assessor remains responsible for the final assessment decision.

AI is an assistant, not the certification authority.

---

# 3. Target Architecture

## Frontend

Reuse the existing React/Vite foundation.

```text
React
Vite
Tailwind / existing UI system
PWA / Service Worker
IndexedDB
```

The exact folder structure should follow the existing repository after the audit rather than forcing a new architecture.

## Backend

Reuse:

```text
Node.js
Express
Prisma
PostgreSQL
JWT authentication
Role guards
```

## Media

For the SIH prototype:

```text
Browser
   ↓
Multer
   ↓
Server disk
   ↓
Metadata/path in PostgreSQL
```

Offline media is stored locally until it can be synchronized.

## AI

Keep AI behind backend service boundaries:

```text
Frontend
   ↓
AI API
   ↓
AI service
   ↓
Model/provider
```

This keeps the model replaceable.

---

# 4. Core Domain Model

The final pivot requires the database to represent:

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

Rubric
RubricItem

Evidence

Score
AISuggestion

CompetencyResult
CertificationRecommendation

AssessorSignOff

TestSet
EvidenceItem
AssessmentRun

SyncRecord
AuditLog
```

The consistency experiment models are part of the schema from the beginning; they are not a late add-on.

---

# 5. Critical Data Hierarchy

The implementation must preserve:

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

The official QP/NOS source material determines the actual assessment criteria and competency rules.

Do not invent official thresholds.

---

# 6. Phase 0 — Repository Audit

## Goal

Understand the existing SkillBridge repository before deleting or rewriting anything.

## Audit

Inspect:

```text
/client
  routes / pages
  components
  auth / role guards
  API helpers
  assessment components
  challenge components
  matching-related UI

/server
  routes
  middleware
  lib/matching.js
  lib/eligibility.js
  Prisma schema
  seed data

/shared / config
  environment
  configuration
  shared types
```

Classify each relevant file:

```text
KEEP
REPURPOSE
MODIFY
REMOVE
NEW
```

## Expected reuse

Likely reusable:

- authentication,
- JWT,
- role guards,
- React/Vite,
- UI components,
- Express,
- Prisma,
- PostgreSQL,
- assessment foundations,
- challenge foundations,
- matching seam.

Likely removed/replaced:

- jobs,
- companies,
- hiring flow,
- recruiter workflow,
- credit system,
- old student skill model.

## Deliverable

Create a concrete file-by-file change list before implementation.

## Exit criterion

No major old-domain file is deleted or rewritten without a documented reason.

---

# 7. Phase 1 — Establish the New Product Shell

## Goal

Make the application visibly an RPL product before building detailed assessment logic.

## Roles

Replace:

```text
Student
Recruiter
Institution
```

with:

```text
Worker
Assessor
Admin / Assessment Organization
```

## Routes

Create/modify:

```text
/worker/*
/assessor/*
/admin/*
```

## Landing page

Position the product around:

> **Get recognized for the skills you already have.**

## Exit criterion

A user can authenticate and reach the correct Worker, Assessor, or Admin area.

---

# 8. Phase 2 — Remove the Old Employment Domain

Remove or disable MVP flows for:

```text
Jobs
Job details
Job applications
Companies
Hiring
Recruiter candidate pipeline
Credits
Old student verification quiz
```

Repurpose instead of deleting where useful:

```text
Challenge → AssessmentTask
Submission → Evidence / assessment submission
Matching → QP/NOS Mapping
Student → Worker
Recruiter → Assessor
Institution → Organization/Admin
```

## Exit criterion

The application no longer presents itself as a hiring marketplace.

---

# 9. Phase 3 — Build the RPL Database

This is the most important backend foundation.

## First

Obtain the real official QP/NOS/assessment material for the selected MVP trade.

Recommended MVP trade:

> **Electrician**

Confirm:

- QP,
- NSQF level,
- NOS,
- performance criteria,
- assessment criteria,
- practical tasks,
- official competency decision rules.

## Implement

```text
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

Rubric
RubricItem

Evidence
Score
AISuggestion

CompetencyResult
CertificationRecommendation
AssessorSignOff

TestSet
EvidenceItem
AssessmentRun

SyncRecord
AuditLog
```

## UUID decision

Use **client-compatible UUID primary keys** for records that can be created offline.

This is a schema decision and must happen here, before offline implementation.

## Exit criterion

The database can represent both the normal RPL workflow and the consistency experiment.

---

# 10. Phase 4 — Load the QP/NOS Dataset

## Full content

Implement complete assessment content for one real QP:

```text
QP
NSQF level
NOS
Performance criteria
Assessment tasks
Assessment criteria
Rubric / scoring descriptors
Official decision rules
```

## Mapping alternatives

Load metadata for approximately:

```text
4–6 real QPs
```

Metadata:

```text
QP title
QP code
NSQF level
NOS names
keywords / occupation terms
```

Only the selected MVP QP needs complete assessment content.

## Source rule

Do not invent official:

- QP names,
- codes,
- NSQF levels,
- NOS names,
- performance criteria,
- pass thresholds.

## Exit criterion

The system has one assessment-ready real QP and enough alternatives for meaningful mapping.

---

# 11. Phase 5 — Worker Declaration

## Worker flow

```text
Register
 ↓
Profile
 ↓
Trade
 ↓
Years of experience
 ↓
Previous work
 ↓
Practical skills/tasks
 ↓
Optional supporting evidence
```

Example:

```text
Trade: Electrician
Experience: 8 years

Domestic wiring
Switch installation
Socket installation
Circuit testing
Fault identification
Electrical safety
```

## Routes

```text
/worker/dashboard
/worker/profile
/worker/declaration
```

## Backend

Implement worker profile and declaration APIs.

## Exit criterion

A worker can save a complete declaration.

---

# 12. Phase 6 — QP/NOS Mapping

## Goal

Replace the old matching concept with RPL qualification mapping.

```text
Worker Declaration
       ↓
Extract skills/tasks
       ↓
Compare against QP/NOS dataset
       ↓
Rank QPs
       ↓
Show relevance score
       ↓
Show reason
       ↓
Assessor confirmation
```

## Output

```text
Top relevant QPs
Relevant NOS
Relevance score
Reason
```

Do not call the score a calibrated probability or “87% confidence”.

## Initial implementation

A simple similarity/matching implementation can be used first.

The matching service must remain replaceable so embeddings/retrieval can be introduced later.

## Assessor control

Provide:

```text
Confirm Mapping
Choose Another QP
```

## Exit criterion

The mapping stage works end-to-end and the assessor can override it.

---

# 13. Phase 7 — Assessment Assignment + Assessor Workspace

## Flow

```text
Confirmed QP
   ↓
Assessment Template
   ↓
Assessment Instance
   ↓
Assessor Dashboard
```

## Assessor routes

```text
/assessor/dashboard
/assessor/assessments
/assessor/assessment/:id
```

## Dashboard

Show:

```text
Assigned
In Progress
Ready for Review
Completed
Signed Off
```

## Exit criterion

An assessor can open a worker's assigned assessment and begin the practical assessment.

---

# 14. Phase 8 — Practical Assessment Core

This is the heart of the MVP.

## Structure

```text
Assessment
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
Assessor Notes
```

## Example

```text
Task: Install a domestic switch

Criterion:
Correct wire connection

Rubric:
0 — Unable
1 — Significant assistance
2 — Independent with minor errors
3 — Correct and consistent
```

The exact descriptors must be grounded in the selected QP/assessment source.

## UI

Build/reuse:

```text
AssessmentCard
AssessmentProgress
TaskChecklist
RubricScoring
AssessorNotes
```

## Exit criterion

An assessor can complete practical tasks, score criteria, and record observations.

---

# 15. Phase 9 — Evidence

## Evidence types

```text
PHOTO
VIDEO
DOCUMENT
ASSESSOR_NOTE
```

Evidence can be attached to:

```text
Assessment
Task
Criterion
```

## Prototype media architecture

```text
Upload
 ↓
Multer
 ↓
Server disk
```

PostgreSQL stores metadata/path.

## Important MVP boundary

Photos/videos are evidence.

Do not imply that the MVP AI automatically judges their visual content.

## Exit criterion

An assessor can capture/upload evidence and associate it with the relevant assessment context.

---

# 16. Phase 10 — Rubric-Based Scoring

Implement criterion-level scoring using standardized descriptors.

Example ordinal scale:

```text
0
1
2
3
```

But the actual scale and descriptors must follow the selected official assessment framework.

## Store

```text
criterion
score
assessor
observation/note
timestamp
```

## Exit criterion

Every required criterion can be scored consistently using a visible rubric.

---

# 17. Phase 11 — AI Assistance

AI should be added after the assessment data flow exists.

## P0 — QP Mapping

```text
Worker declaration
      ↓
AI
      ↓
Top QPs
NOS
Relevance score
Reason
```

## P1 — Evidence-to-Criterion Assistance

For MVP:

```text
Assessor observations/notes
+
Criterion
      ↓
AI
      ↓
Relevant
Possibly Relevant
Not Relevant
```

The AI is not automatically judging the photo/video.

## P1 — Scoring Suggestion

```text
Assessor observations/notes
+
Rubric descriptor
      ↓
AI
      ↓
Suggested score
Reason
```

This is a suggestion, not an objective grade or calibrated probability.

## P1 — Competency Summary

Generate a concise summary from structured assessment results.

## Human-in-the-loop

Store:

```text
AI suggestion
Assessor final decision
Override
Override reason
```

## Failure fallback

```text
AI unavailable
      ↓
Manual assessment continues
```

## Exit criterion

Every AI feature is optional and clearly labeled as assistance.

---

# 18. Phase 12 — Competency Results

Use the official assessment rules.

```text
Assessment scores
      ↓
Published QP/NOS rules
      ↓
Competency result
```

Possible result:

```text
Competent
Not Yet Competent
```

Do not create a generic universal pass percentage unless the actual QP specifies one.

## Exit criterion

A completed assessment generates a defensible competency result.

---

# 19. Phase 13 — Certification Recommendation

```text
Competency result
      ↓
Published rules
      ↓
Certification recommendation
      ↓
Assessor review
```

SkillBridge produces a recommendation.

It does not claim to issue the official NCVET certificate.

## Exit criterion

The recommendation is visible and clearly separated from official certification.

---

# 20. Phase 14 — Assessor Sign-Off

## Workflow

```text
Assessment complete
      ↓
Assessor reviews
      ↓
Confirm / override
      ↓
Sign off
      ↓
Lock
```

After sign-off:

> Assessment becomes immutable/locked.

Store:

```text
assessorId
decision
timestamp
signoff metadata
```

## Exit criterion

A completed assessment can be signed off and cannot be casually changed afterward.

---

# 21. Phase 15 — Competency Profile

Generate:

```text
RPL Competency Profile
```

Show:

```text
Worker
Trade
Qualification
NSQF Level
NOS / competencies
Assessment summary
Evidence summary
Assessor
Recommendation
Sign-off status
```

## Exit criterion

The worker has a clear, human-readable final competency profile.

---

# 22. MVP Boundary

The MVP should aggressively target:

## One trade

Preferably:

> Electrician

## One complete QP

Including:

- NOS,
- NSQF level,
- performance criteria,
- assessment criteria,
- tasks,
- rubric/decision rules.

## 4–6 QP metadata records

For mapping alternatives.

## One complete journey

```text
Worker
 ↓
Declaration
 ↓
QP Mapping
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

The MVP should be judged by completeness of this loop, not by number of features.

---

# 23. Phase 16 — Early Offline Spike

Do this immediately after the practical assessment core works.

Do not wait until the entire application is finished.

## Spike

```text
Download assessment package
        ↓
Disconnect internet
        ↓
Open assessment
        ↓
Change score
        ↓
Add note
        ↓
Queue change
        ↓
Reconnect
        ↓
Sync
        ↓
Verify server state
```

## Requirements

Already established in Phase 3:

```text
Client-generated UUIDs
```

Implement now:

```text
PWA / Service Worker
IndexedDB
SyncRecord
Idempotent sync endpoint
```

## Success criterion

One complete offline → reconnect → sync flow works without duplicate records.

This is the required early technical proof.

---

# 24. Phase 17 — Full Offline Implementation

## Offline architecture

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

## Assessment package

Before going offline, download:

```text
Worker
Confirmed QP/NOS
Tasks
Criteria
Rubrics
Required reference data
```

## Offline assessor actions

Support:

- assessment tasks,
- rubric,
- scoring,
- notes,
- evidence metadata,
- assessment progress.

## Evidence

Images:

> cache locally.

Video:

> capture offline and queue upload.

## AI

AI remains online-only for MVP.

Manual assessment must continue if AI is unavailable.

---

# 25. Phase 18 — Sync and Conflict Handling

## SyncRecord

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

## Status

```text
PENDING
SYNCING
SYNCED
FAILED
CONFLICT
```

## Idempotency

The backend must safely retry the same operation without creating duplicate assessment data.

Use:

```text
entityId + operation/version
```

or an equivalent idempotency key.

## Conflict strategy

Keep the SIH prototype simple.

For worker declarations:

> latest server-confirmed version wins unless the assessment is locked.

For assessment scoring:

> sign-off locks the assessment.

Do not build complex collaborative editing unless required later.

---

# 26. Phase 19 — Consistency Experiment

The experiment is a real system feature.

## Schema

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

Do not reuse the ordinary single-assessor Assessment record as the only experiment storage.

## Participants

Target:

```text
5–6 assessors
```

## Evidence

Prepare:

```text
Evidence Set A
Evidence Set B
```

Sets should be comparable.

## Counterbalanced design

Group 1:

```text
A → Manual
B → Rubric-assisted
```

Group 2:

```text
A → Rubric-assisted
B → Manual
```

Each assessor scores both sets, but the condition order is swapped.

The same assessor does not score the same evidence in both conditions.

This reduces memory/learning bias.

---

# 27. Consistency Metrics

Scores such as 0–3 are ordinal.

Do not use ordinary nominal Fleiss' kappa as the headline statistic.

Prefer:

```text
Weighted Cohen's kappa
```

for two-assessor comparisons, or:

```text
Krippendorff's alpha — ordinal
```

where appropriate for multiple assessors/missing scores.

Also calculate:

```text
Competent
Not Yet Competent
```

agreement using the official competency decision.

## Dashboard

Display actual measured values:

```text
Manual
Criterion-level agreement: X
Competent / Not-Yet-Competent agreement: Y

Rubric-assisted
Criterion-level agreement: X
Competent / Not-Yet-Competent agreement: Y
```

Do not fill these values in before running the experiment.

---

# 28. Consistency Pilot Caveat

The pilot is intentionally small.

Also state a limitation proactively:

> The 5–6 assessors may include members of the project team who are familiar with the rubric, so the manual condition is not a fully independent real-world assessor baseline.

This is not a reason to abandon the experiment.

Instead:

- disclose it,
- avoid overstating the result,
- and, if possible, include at least one real electrician, ITI instructor, or other domain expert.

The experiment should be presented as:

> **a small internal pilot, not a definitive validation study.**

---

# 29. Version 1 — Stable RPL MVP

After the full MVP loop works, Version 1 focuses on reliability and polish.

## Goals

- stable worker flow,
- stable assessor flow,
- reliable evidence,
- reliable scoring,
- reliable sign-off,
- reliable offline synchronization,
- clear AI boundaries,
- auditability.

## Improve

### UX

- mobile-friendly assessment,
- clearer progress,
- better evidence review,
- better rubric presentation,
- useful error states.

### Assessment

- state transitions,
- validation,
- locked assessment handling,
- audit logs.

### Offline

- retry UI,
- failed-sync UI,
- sync status,
- upload reliability,
- basic conflict handling.

### AI

- better QP ranking,
- clearer explanations,
- better observation-based suggestions.

## Version 1 exit

The entire RPL workflow is dependable enough for repeated demonstrations and pilot use.

---

# 30. Version 2 — Multi-Trade Platform

## Goal

Move from one complete demonstration trade to a reusable RPL platform.

Architecture:

```text
Trade
 ↓
QP
 ↓
NOS
 ↓
Assessment Template
 ↓
Assessment Instance
```

Adding a trade should primarily be a data/content operation.

## Add

- additional QPs,
- additional NOS,
- assessment templates,
- rubrics,
- admin QP management,
- multi-trade worker/assessor flows.

Potential future trades:

```text
Electrician
Plumber
Sewing Machine Operator
...
```

Exact expansion should follow official source availability.

---

# 31. Version 2 — Assessment Template System

Separate:

```text
Assessment Template
```

from:

```text
Assessment Instance
```

Template contains:

```text
QP
NOS
Tasks
Criteria
Rubrics
Required evidence
Assessment rules
```

Instance contains the worker-specific assessment.

This makes multi-trade scaling much easier.

---

# 32. Version 2 — Evidence and Analytics

Improve evidence management:

```text
Evidence Gallery
Evidence by Task
Evidence by Criterion
Evidence Timeline
```

Admin analytics:

```text
Workers assessed
Assessments completed
Pending assessments
Competent
Not Yet Competent
Recommendations
Assessments per assessor
Assessment time
AI override rate
```

Move from server-disk media to object storage only when deployment scale requires it.

---

# 33. Version 3 — Assessment Quality / Research Layer

Version 3 turns the consistency experiment into a reusable evaluation system.

## Dashboard

```text
/admin/consistency
```

Show:

- test set,
- assessors,
- condition,
- criterion-level agreement,
- competency agreement,
- manual results,
- rubric-assisted results.

## AI evaluation

Track:

```text
AI suggestion
Assessor decision
Override
Override reason
```

This enables analysis of whether AI assistance is useful without claiming that AI is always correct.

---

# 34. Version 4 — Advanced AI and Scale

Only after the core assessment system is stable.

Potential additions:

```text
Stronger QP/NOS retrieval
Semantic search
Multilingual assistance
Voice input
Voice notes
Advanced competency summaries
Advanced analytics
```

## Future vision/video assistance

Only if a real vision model is implemented:

```text
Photo / Video
      ↓
Vision model
      ↓
Observed signals
      ↓
Criterion association
      ↓
AI suggestion
      ↓
Assessor verification
```

It must remain explicitly assistive unless technical validation and assessment authority requirements justify a stronger role.

---

# 35. Version 4 — Production Scale

If SkillBridge moves beyond the SIH prototype:

```text
Object storage
CDN
Background job queue
Production database hosting
Monitoring
Centralized logging
Backups
Secure secrets management
```

The domain model should remain stable.

---

# 36. Frontend Roadmap

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

The exact implementation should preserve existing routing conventions where possible.

---

# 37. Backend/API Roadmap

Core domains:

```text
/auth

/workers
/workers/:id/profile
/workers/:id/declaration

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

Later:

```text
/admin/qualification-packs
/admin/nos
/admin/consistency
```

---

# 38. Testing Strategy

Testing must follow the roadmap.

## Unit tests

Prioritize:

```text
QP mapping
score validation
competency rules
recommendation rules
role authorization
sync idempotency
```

## Integration tests

Test:

```text
Declaration → Mapping
Mapping → Assessment
Assessment → Evidence
Assessment → Score
Score → Competency
Competency → Recommendation
Recommendation → Sign-Off
```

## Offline tests

Test:

```text
offline creation
offline edit
reconnection
retry
duplicate request
failed upload
conflict
```

## AI failure tests

Simulate:

```text
timeout
provider failure
invalid AI response
AI unavailable
```

The assessment must still work manually.

---

# 39. Security and Data Integrity

At minimum:

- role-based authorization,
- protected assessment APIs,
- server-side validation,
- file type/size restrictions,
- safe media handling,
- audit logging,
- sign-off locking,
- server-side competency rule enforcement,
- safe handling of AI output.

Do not trust client-side competency decisions for final results.

---

# 40. Final SIH Demo Build

The final demo should be one continuous story:

```text
Worker registers
      ↓
Declares experience
      ↓
AI recommends QP
      ↓
Assessor confirms
      ↓
Assessment starts
      ↓
Worker performs practical task
      ↓
Evidence captured
      ↓
Assessor uses rubric
      ↓
AI gives observation-based suggestion
      ↓
Assessor decides final score
      ↓
Internet disconnected
      ↓
Assessment continues offline
      ↓
Internet restored
      ↓
Sync completes
      ↓
Competency profile generated
      ↓
Certification recommendation
      ↓
Assessor signs off
      ↓
Consistency dashboard shows actual pilot measurements
```

The demo must never use fabricated experiment results.

Use:

```text
X vs Y
```

until the experiment has actually been run.

---

# 41. Implementation Milestones

## Milestone A — Architecture Ready

```text
[ ] Repo audit complete
[ ] File-by-file KEEP/REPURPOSE/MODIFY/REMOVE/NEW list
[ ] New roles defined
[ ] Old hiring routes identified
[ ] Official QP source collected
[ ] Schema design approved
[ ] UUID strategy approved
[ ] Experiment schema included
```

## Milestone B — Assessment Core

```text
[ ] Worker declaration
[ ] QP mapping
[ ] Assessor workflow
[ ] Practical tasks
[ ] Criteria
[ ] Rubric
[ ] Evidence
[ ] Scoring
```

## Milestone C — Decision Layer

```text
[ ] Competency rules
[ ] Competency result
[ ] Recommendation
[ ] Sign-off
[ ] Locking
[ ] Competency profile
```

## Milestone D — AI

```text
[ ] QP mapping
[ ] Evidence assistance
[ ] Score suggestion
[ ] Competency summary
[ ] AI override
[ ] AI failure fallback
```

## Milestone E — Offline

```text
[ ] Assessment package
[ ] IndexedDB
[ ] Client UUIDs
[ ] Sync queue
[ ] Idempotent API
[ ] Offline scoring
[ ] Offline notes
[ ] Offline evidence
[ ] Reconnect sync
```

## Milestone F — Consistency

```text
[ ] Recorded test set
[ ] Set A
[ ] Set B
[ ] 5–6 assessors
[ ] Counterbalanced conditions
[ ] Independent criterion-level scores
[ ] Agreement calculation
[ ] Competent/Not-Yet-Competent agreement
[ ] Pilot caveat documented
```

---

# 42. What Not to Build Early

Do not spend MVP time on:

```text
Job marketplace
Employer hiring
Social features
Large multi-trade catalog
Automatic visual grading
Advanced computer vision
Native mobile apps
Complex collaborative editing
Over-engineered conflict resolution
Large analytics platform
```

The first objective is:

> **one complete, credible RPL assessment workflow.**

---

# 43. Architecture Decision Rules

When deciding whether to add a feature, ask:

### Does it improve the RPL assessment loop?

If no, defer it.

### Does it require official QP information?

If yes, source and verify the information before coding the rule.

### Does it affect certification decisions?

If yes, enforce it server-side and keep the assessor/sign-off boundary explicit.

### Does it need to work offline?

If yes, ensure its records use the offline-compatible UUID/sync design.

### Does it use AI?

If yes:

```text
AI suggestion
+
reason
+
human confirmation
```

should be the default.

---

# 44. Final Build Order

The recommended implementation sequence is:

```text
0. Repo Audit
        ↓
1. Roles + Product Shell
        ↓
2. Remove Old Employment Domain
        ↓
3. RPL Schema + UUIDs + Experiment Models
        ↓
4. Official QP/NOS Data
        ↓
5. Worker Declaration
        ↓
6. QP/NOS Mapping
        ↓
7. Assessor Workflow
        ↓
8. Practical Assessment
        ↓
9. Evidence + Media
        ↓
10. Rubric + Scoring
        ↓
11. Competency Results
        ↓
12. Certification Recommendation
        ↓
13. Sign-Off + Lock
        ↓
14. Competency Profile
        ↓
15. AI Assistance
        ↓
16. Early Offline Spike
        ↓
17. Full Offline + Sync
        ↓
18. Consistency Experiment
        ↓
19. Version 1 Stabilization
        ↓
20. Version 2 Multi-Trade
        ↓
21. Version 3 Evaluation
        ↓
22. Version 4 Advanced AI / Scale
```

---

# 45. Final Definition of Done

The core SkillBridge RPL implementation is successful when a real user can go through:

```text
Prior Experience
      ↓
Self Declaration
      ↓
Relevant QP/NOS
      ↓
Assessor Confirmation
      ↓
Practical Assessment
      ↓
Evidence
      ↓
Standardized Rubric
      ↓
AI Assistance
      ↓
Assessor Final Decision
      ↓
Competency Result
      ↓
Certification Recommendation
      ↓
Sign-Off
      ↓
NSQF-Aligned Competency Profile
```

and the same assessment can survive:

```text
Internet unavailable
      ↓
Offline assessment
      ↓
Reconnect
      ↓
Idempotent synchronization
```

while the platform can separately demonstrate:

```text
Manual condition
        vs
Rubric-assisted condition
```

using the actual counterbalanced pilot data.

That is the product the final pivot plan is asking the team to build.
