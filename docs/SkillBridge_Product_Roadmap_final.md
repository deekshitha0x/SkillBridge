# SkillBridge — Product Roadmap

## Product Vision

SkillBridge is a skill-verification and hiring platform that moves every skill through an honest three-stage status — **Pending → Claimed → Verified** — converting practical proof into a portable, leveled Skill Profile that a student owns.

The platform connects three stakeholders:

- **Students** — prove, improve, and showcase their skills.
- **Recruiters** — find candidates based on verified capability.
- **Institutions** — understand the real skill landscape of their students.

### Product Evolution

**MVP → Prove the core concept**  
↓  
**Version 1 → Make it usable end-to-end**  
↓  
**Version 2 → Make it intelligent and scalable**  
↓  
**Version 3 → Build the complete SkillBridge ecosystem**

---

# MVP — Prove Verified Skills Work

## Goal

Build the smallest working version that demonstrates:

> **Claim Skill (Pending) → Verification Quiz (Claimed) → Discover Jobs → Prepare → Take Challenge → Recruiter Verifies (Verified) → Level Up → Build Skill Profile**

The MVP should focus on proving the core loop rather than building every advanced feature.

---

## 1. Student Onboarding

- Google Login
- Basic student profile
- Aadhaar verification
  - For prototype/demo purposes, this can be simulated if real integration is not feasible
- Select/claim skills

At this stage, each claimed skill's status is **Pending** — it has been declared, but not yet Claimed (via quiz) or Verified (via challenge).

---

## 2. Skill Assessment

For each Pending skill:

**Claim Skill (Pending) → Take Verification Quiz → Pass → Skill Status: Claimed (Level = Quiz Score)**

Assessment features:

- Skill-specific assessments
- Timed assessments
- Basic anti-cheating measures
- Basic tab-switch/activity restrictions
- Pending / Claimed status tracking

Once a student passes, the skill's status updates to **Claimed** and appears in their Skill Profile at the level they scored. Claimed is not the highest tier — **Verified** is earned separately, through a recruiter-verified practical challenge (see Section 7 onward).

---

## 3. Skill Profile

The MVP Skill Profile shows:

| Skill | Status | Level |
|---|---|---:|
| Python | Claimed | 3 / 5 |
| SQL | Pending | 0 / 5 |
| C++ | Pending | 0 / 5 |

The key principle:

> **A Claimed skill's level reflects the platform quiz score. That level only increases — and the status only becomes Verified — through a recruiter-verified practical challenge.**

---

# 4. Company & Job Discovery

Each company/job opportunity should have a dedicated **Job Description (JD)**.

### Job Page Structure

**Company A — Backend Developer**

**Job Description**

A complete JD is shown so students understand:

- Role
- Responsibilities
- Required qualifications
- Expected capabilities
- Other relevant information

The JD is then **summarized/minimized into a structured skill requirement section**.

### Required Skills

| Skill | Minimum Requirement |
|---|---:|
| Python | Verified — Level 2+ |
| SQL | Verified — Level 1+ |
| Data Structures | Verified — Level 1+ |

This allows students to immediately understand:

> **“What do I need to be eligible for this company?”**

The same skill-and-level requirement is used to determine eligibility for relevant challenges and hiring stages.

---

# 5. Study Materials & Preparation Resources

For major companies and, where available, other companies, SkillBridge can provide **relevant preparation materials and links below the JD**.

### Example

**Prepare for Company A**

- Python preparation resources
- SQL preparation resources
- DSA resources
- Interview preparation
- Company-specific resources
- Relevant documentation
- Practice platforms
- Other useful links

The objective is to help students prepare **according to the actual job requirements**, rather than studying randomly.

### Preparation Flow

**Read JD → Understand Required Skills & Levels → Access Study Materials → Improve Skills → Attempt Challenges / Apply**

This makes the company page useful not only for applying but also for **job preparation**.

---

# 6. Similar Company Recommendations

Below the preparation resources, SkillBridge recommends **other companies with similar skill requirements or similar job descriptions**.

### Example

A student is preparing for:

> **Company A — Backend Developer**

SkillBridge identifies other opportunities such as:

- Company B — Backend Developer
- Company C — Software Engineer
- Company D — Python Developer
- Company E — Junior Backend Engineer

because they have overlapping:

- Skills
- Required levels
- Job responsibilities
- Technical requirements
- Similar JDs

### Recommendation Principle

> **If you're preparing for one company, show you where else your preparation can be useful.**

This prevents students from preparing for only one opportunity and discovering later that the same preparation could have qualified them for several other companies.

### Recommendation Flow

**Company A JD**  
↓  
**Required Skills + Levels**  
↓  
**SkillBridge identifies similar requirements**  
↓  
**Recommended Companies**  
↓  
**Student can explore / prepare / apply**

---

# 7. Challenge-to-Hire

Recruiters can create practical challenges based on their job requirements.

A challenge can define:

- Required skills
- Minimum Claimed skill levels needed to attempt it
- Difficulty level
- Time limit
- Job/role associated with the challenge

Challenges are designed as **mini projects, practical tasks, or job-specific assessments**.

The objective is to answer:

> **“Can this student actually do the work?”**

rather than:

> **“Does this student's resume say they can?”**

Passing a challenge and being verified by the recruiter is the **only** path to a Verified status on a skill.

---

# 8. Skill-Based Eligibility

Students can only attempt challenges when they meet the minimum Claimed skill levels required.

Example:

### Ram's Skill Profile

- Python — Claimed, Level 3
- SQL — Claimed, Level 1
- C++ — Pending

### Company A Challenge

- Python — Claimed Level 2+
- SQL — Claimed Level 1+

Since Ram's Claimed levels meet the minimum, he is eligible.

If he does not meet the minimum requirement, he cannot attempt the challenge.

This creates:

**Claimed Skill Levels → Eligibility → Challenge**

---

# 9. Completing the Challenge

Challenge features can include:

- Time limits
- Anti-cheating mechanisms
- Environment restrictions
- Basic monitoring
- Submission system

After submission:

**Student → Submission → Recruiter Review**

---

# 10. Recruiter Verification

The recruiter/company verifies the student's performance.

The challenge can function as a **practical pre-interview / mini-interview stage**.

Possible outcomes:

1. **Student gets hired**
2. **Student does not get hired**

Regardless of whether the student is hired, a recruiter-verified pass moves the skill's status to **Verified** and updates its level to the challenge's level — this becomes part of the student's Skill Profile either way.

---

# 11. Skill Levels Update (Verified)

Suppose Company A's challenge requires:

> Python — Claimed Level 2+  
> SQL — Claimed Level 1+

and the challenge itself is rated:

> Python — Level 2  
> SQL — Level 1

Ram successfully completes and passes the challenge, and the recruiter verifies it.

His profile becomes:

| Skill | Status | Level |
|---|---|---:|
| Python | Verified | 2 |
| SQL | Verified | 1 |
| C++ | Pending | 0 |

This Verified status and level remain on his profile **even if he does not get hired**.

The verified performance therefore becomes reusable proof.

---

# 12. Reusable Proof Across Companies

Suppose Company B has a similar requirement:

> Python — Verified, Level 2+  
> SQL — Verified, Level 1+

Ram already has:

> Python — Verified, Level 2 ✓  
> SQL — Verified, Level 1 ✓

Company B can therefore allow Ram to **directly proceed to the interview stage** instead of making him repeatedly prove the same basic capability.

This is one of SkillBridge's core advantages:

> **A verified achievement for one opportunity can create value for future opportunities.**

---

# 13. Institution Dashboard

Keep the institution side simple in the MVP.

The dashboard can show:

- Total students
- Number of skills at each status (Pending / Claimed / Verified)
- Students with specific skills
- Students with skill levels above a threshold
- Skill distribution
- Basic employability/skill statistics

Example:

> 500 students have Python on their Skill Profile (Pending or higher)  
> 342 have Python at Claimed status or higher  
> 127 have Python at Level 2 or higher  
> 89 have Python fully Verified through a recruiter-verified challenge

This gives institutions a clearer picture of actual student capability.

---

# What NOT to Build Yet

Avoid over-engineering the MVP with:

- Complex AI proctoring
- Sophisticated recommendation engines
- Full ATS functionality
- Advanced predictive analytics
- Huge skill taxonomy
- Automated interviews
- Complex ML models
- Fully automated company/JD matching

For recommendations in the MVP, basic **skill-overlap/JD similarity rules** can be enough.

---

# MVP Success Metric

> **Can a student discover a relevant company, understand its skill requirements, prepare using relevant resources, move a skill from Pending to Claimed via assessment, then to Verified via a recruiter-verified challenge, and reuse that verified level for future opportunities?**

---

# Version 1 — Make SkillBridge Genuinely Usable

V1 turns the MVP into a more complete student and recruiter experience.

## 1. Rich Student Skill Profile

Add:

- Skill levels from **1–5**
- Skill status/level history (Pending → Claimed → Verified, with dates)
- Challenge history
- Certificates/evidence section
- Profile sharing
- Skill verification badges
- Skill renewal reminders
- Assessment history

### Example

**Python**

- Status: **Verified**
- Level: **2/5**
- Last verified: June 2026
- Renewal: December 2026

---

# 2. Better Company / Job Pages

Each job page becomes a structured preparation-and-application hub.

### Job Page

**Company + Role**  
↓  
**Full Job Description**  
↓  
**Required Skills + Level Requirements**  
↓  
**Preparation Materials**  
↓  
**Challenge-to-Hire**  
↓  
**Similar Companies**

Students can understand the role, prepare for it, and discover related opportunities from one place.

---

# 3. Advanced Candidate Filtering

Recruiters can search using verified requirements:

> Python — Verified, Level ≥ 2  
> SQL — Verified, Level ≥ 1  
> C++ — Verified, Level ≥ 1

The platform returns candidates who meet those requirements.

Also add:

- Candidate Skill Profiles
- Challenge submissions
- Candidate comparison
- Shortlisting
- Interview status
- Hire / Reject
- Close/deactivate challenge

### Core Shift

Traditional hiring asks:

> **“Who looks good on paper?”**

SkillBridge asks:

> **“Who has already demonstrated the skills I need?”**

---

# 4. Company Similarity Recommendations

Improve the recommendation engine using:

- Skill overlap
- Required levels
- Job role similarity
- JD similarity
- Industry/domain
- Student's current Skill Profile

Example:

> Preparing for Company A's Backend Developer role?

Show:

**Similar Opportunities**

- Company B — Backend Developer
- Company C — Software Engineer
- Company D — Python Developer

The recommendations become increasingly personalized to the student's preparation path.

---

# 5. Skill Renewal

Verified skills can require renewal every **6–12 months**.

Example:

> Python's Verified status expires soon.

Student completes a renewal assessment or fresh challenge.

↓

**If passed, the skill remains Verified and current, at the newly confirmed level.**

If the renewal window lapses, the skill's status steps back down to **Claimed** (at its last known level) until it is Verified again.

---

# Version 2 — Make SkillBridge Intelligent

V2 introduces intelligence, automation, and personalization.

## 1. AI-Assisted Proctoring

Assessment monitoring can detect or flag:

- Suspicious tab switching
- Multiple faces
- Unusual activity
- Copy/paste behaviour
- Suspicious assessment patterns
- Other integrity signals

Model:

> **AI detects → System flags → Human/system review**

AI supports the verification process rather than blindly making every final decision.

---

# 2. Smart Company & Job Recommendations

SkillBridge learns from:

- Student's skill statuses and levels
- Challenge history
- Target roles
- Previously viewed jobs
- Preparation activity

Then recommends:

> **Companies you are already close to qualifying for**

and:

> **Companies you could qualify for by improving specific skills.**

Example:

Ram has:

- Python — Verified, Level 2
- SQL — Verified, Level 1
- DSA — Claimed, Level 1

SkillBridge can show:

**Eligible now**

- Company A
- Company B

**Almost eligible**

- Company C — needs SQL Level +1 (Verified)
- Company D — needs DSA Level +1 (Verified)

---

# 3. Intelligent Skill Gap Analysis

For a target role:

### Backend Developer

| Skill | Current Level | Required Level |
|---|---:|---:|
| Python | 2 | 2 |
| SQL | 1 | 2 |
| DSA | 1 | 2 |

SkillBridge identifies:

- 🟢 Python — sufficient
- 🔴 SQL — needs improvement
- 🔴 DSA — needs improvement

Then recommends:

> **SQL Level 2 → DSA Level 2 → Backend Challenges**

---

# 4. AI-Based JD Understanding

SkillBridge can extract structured information from a company's JD:

- Required skills
- Preferred skills
- Experience requirements
- Role type
- Skill levels
- Related technologies
- Job category

The system converts an unstructured JD into a clear:

> **Skills + Levels + Eligibility + Preparation Path**

This also improves similar-company recommendations.

---

# 5. Smarter Recruiter Matching

A recruiter posts:

> Backend Developer  
> Python — Verified, Level ≥ 2  
> SQL — Verified, Level ≥ 2  
> DSA — Verified, Level ≥ 1

SkillBridge automatically identifies and ranks eligible candidates based on verified capability.

---

# 6. Institution Intelligence

Institutions can see:

### Skill Supply
How many students possess each skill (at any status)?

### Skill Quality
At what level, and at what status (Claimed vs. Verified)?

### Skill Gaps
Which skills are missing?

### Industry Demand
Which skills are recruiters asking for?

### Employability Gap
What skills are demanded vs. what students actually possess?

---

# Version 3 — Build the SkillBridge Ecosystem

V3 expands SkillBridge into a broader skill reputation and career ecosystem.

## 1. Portable Skill Passport

Every student gets a **portable verified Skill Passport**.

Conceptually:

> **LinkedIn Profile + GitHub proof + verified assessment record + practical experience**

but centred around **verified skills**.

Students can share their SkillBridge profile with companies.

---

# 2. Cross-Company Skill Levels

A student's Verified levels remain useful across companies.

Example:

**Company A Challenge**  
↓  
**Recruiter-verified capability**  
↓  
**SkillBridge Skill Profile (Verified, Level X)**  
↓  
**Company B recognises existing proof**  
↓  
**Direct interview / advanced challenge**

This creates **portable proof of capability**.

---

# 3. Skill Reputation System

Over time, SkillBridge can build a deeper reputation layer.

Example:

### Python

- Status: Verified
- Level 3/5
- 4 practical challenges completed
- 3 recruiter verifications
- Recently renewed

This provides stronger evidence than simply writing:

> “Python — Intermediate”

on a resume.

---

# 4. Personalized Career Preparation Paths

SkillBridge can eventually create a complete preparation path for a student's target role/company.

Example:

### Target: Backend Developer

**Current Skills**  
↓  
**Gap Analysis**  
↓  
**Recommended Study Materials**  
↓  
**Relevant Challenges**  
↓  
**Similar Companies**  
↓  
**Applications**  
↓  
**Interviews**

This turns SkillBridge from a hiring platform into a **career preparation ecosystem**.

---

# 5. Continuous Skill Renewal

The platform automatically tracks verification expiry.

Example:

> ⚠️ Python's Verified status expires in 30 days

Student completes the renewal assessment.

↓

**Skill remains Verified and active.**

This keeps the Skill Profile alive rather than static.

---

# 6. Advanced Institutional Intelligence

Institutions can eventually see:

### Skill Supply
How many students possess each skill?

### Skill Quality
At what status and level?

### Skill Gaps
Which skills are missing?

### Industry Demand
Which skills are recruiters asking for?

### Company Readiness
How many students are currently eligible for specific company roles?

### Employability Gap
What skills are demanded vs. what students actually possess?

This can eventually become:

> **Industry Demand ↔ Student Capability**

analytics for colleges.

---

# Full Roadmap at a Glance

| Feature | MVP | V1 | V2 | V3 |
|---|:---:|:---:|:---:|:---:|
| Student Login | ✅ | ✅ | ✅ | ✅ |
| Identity Verification | Basic | Real | Advanced | Advanced |
| Skill Claims (Pending) | ✅ | ✅ | ✅ | ✅ |
| Verification Quiz (Claimed) | ✅ | Improved | AI-assisted | Adaptive |
| Anti-Cheating | Basic | Better | AI Proctoring | Advanced |
| Skill Profile | Basic | Rich | Intelligent | Portable Passport |
| Skill Levels 1–5 | Basic | ✅ | Dynamic | Dynamic |
| Verified / Claimed / Pending Status Model | ✅ | ✅ | Smarter | Portable |
| Company / Job Pages | Basic | Full | Intelligent | Ecosystem |
| Full Job Description | ✅ | ✅ | AI-structured | Dynamic |
| Required Skills + Levels | ✅ | ✅ | Smart extraction | Dynamic |
| Study Materials | Basic links | Curated | Personalized | Adaptive |
| Similar Company Recommendations | Basic rules | Improved | AI-powered | Predictive |
| Challenges | Basic | Full | Personalized | Industry ecosystem |
| Recruiter Verification | ✅ | ✅ | Enhanced | Reputation-based |
| Recruiter Filtering | Basic | Advanced | AI-powered | Predictive |
| Challenge Matching | — | Basic | AI Matching | Advanced |
| Skill Gap Analysis | — | — | ✅ | Advanced |
| Institution Dashboard | Basic | Analytics | Skill Intelligence | Industry Intelligence |
| Skill Renewal | — | ✅ | Automated | Continuous |
| Career Preparation Path | — | Basic | AI-powered | Personalized ecosystem |
| Recommendations | — | Basic | AI-powered | Personalized |

---

# Core SkillBridge Loop

The fundamental product loop is:

## **CLAIM → QUIZ (CLAIMED) → DISCOVER → PREPARE → CHALLENGE → RECRUITER VERIFICATION (VERIFIED) → LEVEL UP → REUSE**

The MVP should prove this loop works.

Later versions progressively add:

**Intelligence → Automation → Personalization → Scale**

---

# Final Product Positioning

SkillBridge is not primarily another certificate platform or another resume platform.

It creates a system where:

> **Skills become verified, cumulative, portable proof of capability.**

And the company/job layer adds another important dimension:

> **Students don't just find jobs. They understand what companies require, prepare for those requirements, and discover multiple opportunities where the same preparation is useful.**

### Core Principle

> ## **Don't just tell us what you know. Prove what you can do.**
