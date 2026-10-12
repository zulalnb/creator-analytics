# Creator Analytics

## Documentation

Before implementing features, read the relevant documentation in `docs/`.

- `docs/API_DESIGN.md`: Architecture, data flow, and API design assumptions.
- `docs/STREAM_DATA_MODEL.md`: Raw stream data model and metric calculation rules.
- `docs/ASSESSMENT_RULES.md`: Creator assessment categories, thresholds, and evidence requirements.

Treat these documents as the source of truth for project-specific decisions.
Do not silently change documented assumptions or business rules.

If the documentation is ambiguous, incomplete, or conflicts with the existing implementation:
1. Identify the ambiguity or conflict.
2. Explain its impact.
3. Ask for clarification before making significant architectural or business-rule changes.

Reuse the existing project structure and dependencies unless there is a clear reason not to.

## Project Overview

A small creator performance analytics dashboard built as a case study.

The dashboard helps operations teams evaluate content creators based on their
live streaming consistency, average watch duration, and published short clips.

The application uses mock data for 10 content creators over two consecutive
weeks. No real social media integrations or backend infrastructure are required.

## Tech Stack

- React
- TypeScript
- React Router
- Vite
- shadcn/ui (if installed)
- Recharts (if installed)

Use the existing project setup and dependencies. Do not install additional
libraries unless they provide clear value.

## Core Requirements

For each creator, track:

- Planned stream count
- Completed stream count
- Average watch duration
- Published clip count

The dashboard must:

- Calculate stream completion rates.
- Compare metrics between two consecutive weeks.
- Show changes in metrics clearly.
- Generate automated creator assessments.
- Provide evidence-based, actionable recommendations.

## Creator Assessments

The application must support three assessment categories:

1. Consistent and progressing positively
2. Streaming consistency issues
3. Insufficient data for evaluation

Every assessment must include:

- The relevant metrics supporting the assessment
- A concise explanation of the observed result
- A concrete recommended next action

Assessment rules must be explicit, deterministic, and testable.

Do not present assumptions as facts. Recommendations must be supported by
available data.

## Data Handling

- Use mock JSON data.
- Keep raw data separate from derived metrics.
- Calculate completion rates and weekly changes in TypeScript.
- Represent missing measurements with `null`, not `0`.
- Never calculate a completion rate when the planned stream count is zero.
- Do not calculate weekly changes when the required comparison data is missing.
- Distinguish missing data from a genuine value of zero.
- Handle empty datasets and invalid values safely.

## Metric Definitions

Stream completion rate:

completed streams / planned streams * 100

Weekly change:

week 2 value - week 1 value

Express completion-rate changes in percentage points.

For example, a change from 50% to 75% is an increase of 25 percentage points.

Calculate average watch duration using completed streams with valid measurements.
Do not treat missing watch-duration measurements as zero.

## Assessment Rules

Define thresholds explicitly and document them as prototype assumptions.

Prioritize insufficient data when the required measurements are unavailable.

Evaluate streaming consistency separately from audience engagement.

Do not assume that higher follower counts, more clips, or longer watch durations
automatically indicate better overall performance.

Do not infer causes that cannot be established from the available data.

## Code Quality

- Use TypeScript types for data models and derived results.
- Avoid `any` unless there is a compelling reason.
- Keep calculations separate from UI components.
- Prefer small, pure, reusable functions.
- Avoid duplicating business logic in components.
- Handle edge cases explicitly.
- Use meaningful variable and function names.

## UI Guidelines

- Prioritize clarity and information hierarchy.
- Make weekly comparisons easy to understand.
- Show missing data explicitly.
- Use consistent formatting for percentages, durations, and counts.
- Ensure the interface works on desktop and mobile.
- Reuse existing UI components where appropriate.

## Development Workflow

Before implementing a feature:

1. Understand the requirement.
2. Identify relevant data and business rules.
3. Consider missing-data and boundary cases.
4. Implement the smallest appropriate solution.
5. Verify the calculations and behavior.

Do not introduce unnecessary abstractions or infrastructure.

The target is a focused, working prototype rather than a production-scale platform.

## Delivery

The final deliverable should include:

- A working dashboard
- Mock data for 10 creators across two weeks
- Automated assessments and recommendations
- A short explanation of calculation and assessment rules
- A brief demo walkthrough