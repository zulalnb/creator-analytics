import { formatMinutes, formatNumber, formatPercent, formatSigned } from "./format";
import type {
  Assessment,
  AssessmentSignal,
  CreatorAssessment,
  CreatorWeeklyAnalytics,
  WeekNumber,
  WeeklyMetrics,
} from "./types";

// Prototype assumptions from docs/ASSESSMENT_RULES.md, not industry standards.
export const COMPLETION_RATE_THRESHOLD = 75;
export const COMPLETION_RATE_DROP_THRESHOLD = 25;

const EPSILON = 1e-9;

function getWeek(analytics: CreatorWeeklyAnalytics, week: WeekNumber): WeeklyMetrics {
  return week === 1 ? analytics.week1 : analytics.week2;
}

function getWeeksWhere(
  analytics: CreatorWeeklyAnalytics,
  isMissing: (week: WeeklyMetrics) => boolean,
): WeekNumber[] {
  return ([1, 2] as WeekNumber[]).filter((week) => isMissing(getWeek(analytics, week)));
}

function describeWeeks(weeks: WeekNumber[]): string {
  return weeks.length === 2 ? "both weeks" : `week ${weeks[0]}`;
}

function describeStreams(week: WeeklyMetrics): string {
  const rate = week.completionRate === null ? "n/a" : formatPercent(week.completionRate);
  return `${week.completedStreams}/${week.plannedStreams} streams (${rate})`;
}

function joinSentences(...sentences: string[]): string {
  return sentences.filter(Boolean).join(" ");
}

function buildCompletionEvidence(analytics: CreatorWeeklyAnalytics): string[] {
  const change = analytics.changes.completionRateChange ?? 0;
  const movement =
    Math.abs(change) < EPSILON
      ? "was unchanged"
      : `${change > 0 ? "rose" : "dropped"} ${formatNumber(Math.abs(change))} percentage points`;

  return [
    `Week 1: ${describeStreams(analytics.week1)}.`,
    `Week 2: ${describeStreams(analytics.week2)}.`,
    `Completion rate ${movement}.`,
  ];
}

function withEvidence(
  evidenceItems: string[],
): Pick<Assessment, "evidence" | "evidenceItems"> {
  const items = evidenceItems.filter(Boolean);
  return { evidence: joinSentences(...items), evidenceItems: items };
}

function buildWatchDurationEvidence(analytics: CreatorWeeklyAnalytics): string {
  const change = analytics.changes.averageWatchDurationChange;

  if (change === null) {
    const weeks = getWeeksWhere(analytics, (week) => week.averageWatchDurationMinutes === null);
    return `Average watch duration change could not be calculated: no valid measurement for ${describeWeeks(weeks)}.`;
  }

  const range = `${formatMinutes(analytics.week1.averageWatchDurationMinutes!)} → ${formatMinutes(analytics.week2.averageWatchDurationMinutes!)}`;
  if (Math.abs(change) < EPSILON) return `Average watch duration was unchanged (${range}).`;

  const interpretation =
    change > 0
      ? "This is a positive engagement signal; it does not prove content quality improved."
      : "This is a signal to monitor.";
  return `Average watch duration ${range} (${formatSigned(change, " min")}). ${interpretation}`;
}

function buildClipsEvidence(analytics: CreatorWeeklyAnalytics): string {
  const change = analytics.changes.publishedClipsChange;

  if (change === null) {
    const weeks = getWeeksWhere(analytics, (week) => week.publishedClips === null);
    return `Published clips change could not be calculated: the clip total is unavailable for ${describeWeeks(weeks)}.`;
  }

  const range = `${analytics.week1.publishedClips} → ${analytics.week2.publishedClips}`;
  if (change === 0) return `Published clips were unchanged (${range}).`;
  return `Published clips ${range} (${formatSigned(change)}).`;
}

function buildMetricFollowUps(analytics: CreatorWeeklyAnalytics): string {
  const { averageWatchDurationChange, publishedClipsChange } = analytics.changes;
  const followUps: string[] = [];

  if (averageWatchDurationChange === null) {
    followUps.push("Verify the missing watch duration measurements.");
  } else if (averageWatchDurationChange < -EPSILON) {
    followUps.push("Monitor the drop in average watch duration.");
  }

  if (publishedClipsChange === null) {
    followUps.push("Verify the missing clip data.");
  } else if (publishedClipsChange < 0) {
    followUps.push("Monitor the drop in published clips.");
  }

  return followUps.join(" ");
}

function assessInsufficientData(analytics: CreatorWeeklyAnalytics): Assessment {
  const missingWeeks = getWeeksWhere(analytics, (week) => week.completionRate === null);
  const availableWeeks = ([1, 2] as WeekNumber[]).filter((week) => !missingWeeks.includes(week));

  const evidenceItems = [
    ...missingWeeks.map(
      (week) =>
        `Week ${week} has ${getWeek(analytics, week).plannedStreams} planned streams, so the completion rate cannot be calculated.`,
    ),
    ...availableWeeks.map((week) => `Week ${week}: ${describeStreams(getWeek(analytics, week))}.`),
  ];
  const weeksLabel = missingWeeks.length === 2 ? "weeks 1 and 2" : `week ${missingWeeks[0]}`;

  return {
    category: "insufficient_data",
    ...withEvidence(evidenceItems),
    nextAction: `Verify the stream plan and completion records for ${weeksLabel} to complete the assessment.`,
    signals: ["missing_week_data"],
  };
}

function assessConsistencyIssue(
  analytics: CreatorWeeklyAnalytics,
  signals: AssessmentSignal[],
): Assessment {
  return {
    category: "consistency_issue",
    ...withEvidence([
      ...buildCompletionEvidence(analytics),
      signals.includes("completion_below_threshold")
        ? `Week 2 completion rate is below the ${COMPLETION_RATE_THRESHOLD}% threshold.`
        : "",
      signals.includes("completion_drop")
        ? `The drop meets the ${COMPLETION_RATE_DROP_THRESHOLD}-percentage-point threshold.`
        : "",
      buildWatchDurationEvidence(analytics),
      buildClipsEvidence(analytics),
    ]),
    nextAction: joinSentences(
      "Discuss the missed streams with the creator and agree on an achievable streaming plan for next week.",
      buildMetricFollowUps(analytics),
    ),
    signals,
  };
}

function assessPositiveProgress(
  analytics: CreatorWeeklyAnalytics,
  signals: AssessmentSignal[],
): Assessment {
  const schedule = signals.includes("completion_increase") ? "improved" : "current";

  return {
    category: "consistent_positive_progress",
    ...withEvidence([
      ...buildCompletionEvidence(analytics),
      buildWatchDurationEvidence(analytics),
      buildClipsEvidence(analytics),
    ]),
    nextAction: joinSentences(
      `Keep the ${schedule} streaming schedule and apply the same stream plan next week.`,
      buildMetricFollowUps(analytics),
    ),
    signals,
  };
}

/**
 * Evaluation order (docs/ASSESSMENT_RULES.md §6):
 * insufficient_data → consistency_issue → consistent_positive_progress.
 * Returns null for the documented edge case where data is sufficient but no
 * category applies (no consistency issue and no improving indicator).
 */
export function assessCreator(analytics: CreatorWeeklyAnalytics): Assessment | null {
  const { week1, week2, changes } = analytics;

  if (week1.completionRate === null || week2.completionRate === null) {
    return assessInsufficientData(analytics);
  }

  const consistencySignals: AssessmentSignal[] = [];
  if (week2.completionRate < COMPLETION_RATE_THRESHOLD - EPSILON) {
    consistencySignals.push("completion_below_threshold");
  }
  if ((changes.completionRateChange ?? 0) <= -COMPLETION_RATE_DROP_THRESHOLD + EPSILON) {
    consistencySignals.push("completion_drop");
  }
  if (consistencySignals.length > 0) {
    return assessConsistencyIssue(analytics, consistencySignals);
  }

  const positiveSignals: AssessmentSignal[] = [];
  if ((changes.completionRateChange ?? 0) > EPSILON) positiveSignals.push("completion_increase");
  if ((changes.averageWatchDurationChange ?? 0) > EPSILON) positiveSignals.push("watch_duration_increase");
  if ((changes.publishedClipsChange ?? 0) > 0) positiveSignals.push("clips_increase");
  if (positiveSignals.length > 0) {
    return assessPositiveProgress(analytics, positiveSignals);
  }

  return null;
}

export function assessAllCreators(analyticsList: CreatorWeeklyAnalytics[]): CreatorAssessment[] {
  return analyticsList.map((analytics) => ({
    creatorId: analytics.creatorId,
    assessment: assessCreator(analytics),
  }));
}
