# AI Module Documentation

## Overview

The AI module provides 16 AI-powered features using **Groq** (primary) and **OpenRouter** (fallback) as LLM providers. All endpoints require JWT authentication and enforce role-based access control.

**Swagger UI**: `http://localhost:4000/api/docs` — all AI endpoints are grouped under `ai-teacher`, `ai-admin`, `ai-student`, and `ai-analytics` tags.

## Architecture

- **`AiProviderService`** — Unified LLM client. Tries Groq first; auto-falls back to OpenRouter on 429/5xx.
- **`AiSafetyService`** — System prompt injection, content filtering, PII scrubbing, usage logging.
- **`AiCreditService`** — Per-role/per-module daily and monthly usage limits (reads from `ai_credit_allocations` table).

## Endpoints

### Teacher Endpoints (`/ai/teacher`)

| Method | Path | Description | Roles |
|--------|------|-------------|-------|
| `POST` | `/ai/teacher/homework` | Generate homework assignment | TEACHER, ADMIN, PRINCIPAL, SUPER_ADMIN |
| `POST` | `/ai/teacher/quiz` | Generate quiz (MCQ, short, long) | TEACHER, ADMIN, PRINCIPAL, SUPER_ADMIN |
| `POST` | `/ai/teacher/lesson-plan` | Generate detailed lesson plan | TEACHER, ADMIN, PRINCIPAL, SUPER_ADMIN |
| `POST` | `/ai/teacher/question-paper` | Generate exam question paper | TEACHER, ADMIN, PRINCIPAL, SUPER_ADMIN |
| `POST` | `/ai/teacher/report-card-remarks` | Generate report card remarks from real data | TEACHER, ADMIN, PRINCIPAL, SUPER_ADMIN |

### Admin Endpoints (`/ai/admin`)

| Method | Path | Description | Roles |
|--------|------|-------------|-------|
| `POST` | `/ai/admin/notice` | Generate school notice/circular | ADMIN, PRINCIPAL, SUPER_ADMIN |
| `POST` | `/ai/admin/parent-message` | Generate parent message | TEACHER, ADMIN, PRINCIPAL, SUPER_ADMIN |

### Student Endpoints (`/ai/student`)

| Method | Path | Description | Roles |
|--------|------|-------------|-------|
| `POST` | `/ai/student/doubt` | Ask a doubt (age-appropriate AI response) | STUDENT, SUPER_ADMIN |
| `POST` | `/ai/student/chapter-summary` | Generate chapter summary + revision notes | STUDENT, TEACHER, SUPER_ADMIN |
| `POST` | `/ai/student/flashcards` | Generate revision flashcards | STUDENT, TEACHER, SUPER_ADMIN |
| `POST` | `/ai/student/practice-quiz` | Personalized quiz from weak topics | STUDENT, SUPER_ADMIN |

### Analytics Endpoints (`/ai/analytics`)

| Method | Path | Description | Roles |
|--------|------|-------------|-------|
| `POST` | `/ai/analytics/progress-summary` | Parent-friendly progress report | TEACHER, ADMIN, PRINCIPAL, PARENT, SUPER_ADMIN |
| `POST` | `/ai/analytics/attendance-risk` | Attendance risk analysis | TEACHER, ADMIN, PRINCIPAL, PARENT, SUPER_ADMIN |
| `POST` | `/ai/analytics/weak-subjects` | Detect weak subjects from marks | TEACHER, ADMIN, PRINCIPAL, PARENT, SUPER_ADMIN |

## Environment Variables

```env
# Required
GROQ_API_KEY=gsk_...

# Optional (for fallback)
OPENROUTER_API_KEY=sk-or-...

# Configurable
GROQ_MODEL=llama-3.3-70b-versatile
OPENROUTER_MODEL=meta-llama/llama-3.3-70b-instruct
AI_MAX_OUTPUT_TOKENS=2048
AI_TEMPERATURE=0.7
```

## Safety Controls

1. **System prompt injection** — Every request starts with a safety preamble.
2. **Student endpoints** use a stricter preamble with class-level context and guided learning (no direct answers).
3. **Content filtering** — Blocklist regex checks for violence, profanity, adult content.
4. **PII scrubbing** — Emails, phone numbers, card numbers are redacted from AI output.
5. **Usage logging** — Every AI call is logged to `ai_usage_logs` with `is_flagged` boolean.
6. **Flagged responses** are blocked and replaced with a safe fallback message.

## Usage Limits

Configure limits in the `ai_credit_allocations` table:

```sql
INSERT INTO tenant.ai_credit_allocations (id, role, module, daily_limit, monthly_limit)
VALUES
  (gen_random_uuid(), 'student', 'doubt_solver', 20, 200),
  (gen_random_uuid(), 'student', '*', 10, 100),
  (gen_random_uuid(), 'teacher', '*', 50, 500);
```

- `module = '*'` applies as a fallback for any module without a specific allocation.
- If no allocation exists for a role/module, usage is unlimited (no limits enforced).

## Database Tables

- **`ai_usage_logs`** — Tracks every AI call (user, module, model, tokens, latency, flagged status).
- **`ai_credit_allocations`** — Configurable daily/monthly limits per role per module.

## Data-Driven Features

These features query **real data** from the database before calling the AI:

- **Report Card Remarks** — Fetches student's exam results + attendance
- **Progress Summary** — Queries all results and attendance records
- **Attendance Risk** — Computes per-student attendance statistics
- **Weak Subject Detection** — Analyzes marks per subject to find below-average performance
- **Practice Quiz** — Auto-detects weak topics from exam results
- **Parent Message** — Looks up student name, class, and guardian info
- **Doubt Solver** — Fetches student's class level for age-appropriate responses
