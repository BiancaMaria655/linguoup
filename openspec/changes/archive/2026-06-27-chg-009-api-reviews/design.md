## Context

LinguoUp's learning engine is built on microlearning lessons (CHG-006). After a student completes a lesson, vocabulary and grammar items need periodic reinforcement. Without spaced repetition, retention decays exponentially (Ebbinghaus forgetting curve).

This change embeds the SM-2 (SuperMemo 2) spaced repetition algorithm directly into the `learning` module of the NestJS backend. It introduces the `SpacedReviewItem` entity and exposes two endpoints: one to fetch items due for review and one to record review results.

**Current state**: No review/repetition mechanism exists. Items are learned once and never revisited unless the student manually returns to a lesson.

**Constraints**:
- V1 is a Modular Monolith — the algorithm lives inside the `learning` module, not a separate service.
- SM-2 is deterministic and well-documented, eliminating algorithmic ambiguity.
- Depends on CHG-006 (lessons): `SpacedReviewItem` is created when a lesson is completed.

## Goals / Non-Goals

**Goals:**
- Implement SM-2 algorithm as a domain service (`SM2AlgorithmService`) with full unit test coverage.
- Persist `SpacedReviewItem` (per vocabulary/grammar item per user) in PostgreSQL via Prisma.
- Automatically create `SpacedReviewItem` records when a lesson is completed.
- Expose `GET /api/v1/reviews/recommended` to return items due for review, ordered by priority.
- Expose `POST /api/v1/reviews/complete` to record review quality and compute the next interval.
- Award XP for completed reviews (integrate with gamification module).
- Full observability: structured logs, OpenTelemetry tracing, p50/p95/p99 metrics per endpoint.

**Non-Goals:**
- Frontend/UI for the review experience (CHG-011).
- Advanced ML-based scheduling or personalization (V2+).
- Extraction to a dedicated Recommendation Service (V2+).
- Conversational AI review content (V3).
- Admin dashboard for review analytics (out of scope for V1).

## Decisions

### D1: Use SM-2 over alternatives (FSRS, Leitner)

**Decision**: SM-2 algorithm.

**Rationale**: SM-2 is battle-tested (used in Anki, SuperMemo), deterministic, and requires no training data. FSRS (Anki's newer algorithm) offers better accuracy but requires historical data and is complex to implement correctly. Leitner boxes are simpler but less precise for language learning. For V1-MVP, SM-2 offers the best correctness/simplicity trade-off.

**Alternatives considered**:
- FSRS: Better accuracy, but stateful and harder to unit test deterministically.
- Leitner: Simpler, but bucket-based intervals don't adapt per item.
- Flat daily reviews: No adaptation at all — rejected immediately.

### D2: Embed algorithm in `learning` module, not a separate service

**Decision**: `SM2AlgorithmService` lives inside `apps/api/src/learning/`.

**Rationale**: V1 is a Modular Monolith. Extracting to a microservice now introduces operational overhead (service discovery, inter-service auth, latency) with no benefit at MVP scale. The architecture explicitly plans extraction to V2+ Recommendation Service.

**Alternatives considered**:
- Separate NestJS module `reviews/`: cleaner isolation, but same binary → no real separation.
- External recommendation service: premature for MVP, increases infra complexity.

### D3: `SpacedReviewItem` created on lesson completion (event-driven within monolith)

**Decision**: When `CompleteLesson` use case runs, it triggers `CreateSpacedReviewItemsUseCase` synchronously in the same transaction.

**Rationale**: In V1 monolith, synchronous in-transaction creation guarantees consistency. If lesson completion is recorded but items are not created (e.g., async failure), the student would never see those items for review.

**Alternatives considered**:
- Domain events + async handler: better decoupling, but adds complexity and eventual consistency risk in V1.
- Background job (cron): delays item creation and complicates rollback.

### D4: Quality scale 0–5 (SM-2 standard)

**Decision**: Accept integer `quality` in `[0, 5]` from client.

**Rationale**: Standard SM-2 input. Maps directly to the algorithm's formula without transformation. Client-side UX may map this to star ratings or difficulty buttons (CHG-011's concern).

### D5: XP awarded on review completion

**Decision**: Integrate with gamification module (`AwardXpUseCase`) from CHG-008. Award a fixed XP per review (e.g., 5 XP per item reviewed).

**Rationale**: Reinforces the habit loop. Review completion should feel rewarding. XP amount is configurable in the future.

## Risks / Trade-offs

| Risk | Mitigation |
|------|-----------|
| SM-2 easeFactor drift (below 1.3 after many failures) | Clamp `easeFactor` to `min 1.3` in algorithm service |
| Lesson items not clearly labeled as vocabulary vs. grammar | Use `itemType` field on `SpacedReviewItem`; lesson model must expose item list |
| Overdue items flooding the user (hundreds of items due) | `limit` query param (default 20) caps response; return `overdueCount` in metadata |
| Prisma transaction failure when creating review items on lesson complete | Wrap in a single `prisma.$transaction()` to ensure atomicity |
| XP award failure should not fail the review completion | Award XP in a non-critical path; log and continue on XP service failure |
| Clock skew in `nextReviewAt` calculation | Use UTC timestamps exclusively; `new Date()` server-side only |

## Migration Plan

1. **Schema migration**: Add `SpacedReviewItem` table via `pnpm db:migrate:dev` (requires approval per AGENTS.md).
2. **Backfill** (optional): For existing users who completed lessons before this change, a one-time migration script can create `SpacedReviewItem` records. Not required for V1-MVP (only new completions are tracked).
3. **Deploy**: Standard Blue-Green deployment via GitHub Actions. No feature flags required — new endpoints are additive.
4. **Rollback**: Remove the two new endpoints; `SpacedReviewItem` table can remain (no data loss for existing data).

## Open Questions

- Should reviews be scoped per `tenant_id` for multi-tenant isolation? (Assumed: yes, same as all other entities.)
- What is the XP value per reviewed item? (Assumed: 5 XP per item, adjustable in constants.)
- Should `overdueCount` count items where `nextReviewAt < today` only, or include today? (Assumed: `nextReviewAt <= now()`.)
