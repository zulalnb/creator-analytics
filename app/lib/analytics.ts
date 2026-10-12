import type {
  Creator,
  CreatorWeeklyAnalytics,
  StreamRecord,
  WeekNumber,
  WeeklyMetrics,
} from "./types";

// Prototype assumption (not defined in docs/): weeks are Monday–Sunday in +03:00.
// Week 1 = 2026-10-05..2026-10-11, week 2 = 2026-10-12..2026-10-18.
export const WEEK_1_START = "2026-10-05T00:00:00+03:00";

const WEEK_DURATION_MS = 7 * 24 * 60 * 60 * 1000;
const week1StartMs = Date.parse(WEEK_1_START);

function isValidMeasurement(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value) && value >= 0;
}

export function getWeekNumber(scheduledAt: string): WeekNumber | null {
  const offsetMs = Date.parse(scheduledAt) - week1StartMs;
  if (Number.isNaN(offsetMs) || offsetMs < 0 || offsetMs >= 2 * WEEK_DURATION_MS) {
    return null;
  }
  return offsetMs < WEEK_DURATION_MS ? 1 : 2;
}

export function calculateCompletionRate(
  plannedStreams: number,
  completedStreams: number,
): number | null {
  if (plannedStreams <= 0) return null;
  return (completedStreams / plannedStreams) * 100;
}

export function calculateAverageWatchDuration(records: StreamRecord[]): number | null {
  const measurements = records
    .filter((record) => record.status === "completed")
    .map((record) => record.averageWatchDurationMinutes)
    .filter(isValidMeasurement);

  if (measurements.length === 0) return null;
  return measurements.reduce((sum, value) => sum + value, 0) / measurements.length;
}

export function calculatePublishedClips(records: StreamRecord[]): number | null {
  if (records.length === 0) return null;

  const clips = records.map((record) => record.publishedClips);
  if (!clips.every(isValidMeasurement)) return null;
  return clips.reduce((sum, value) => sum + value, 0);
}

export function calculateWeeklyMetrics(records: StreamRecord[]): WeeklyMetrics {
  const plannedStreams = records.length;
  const completedStreams = records.filter((record) => record.status === "completed").length;

  return {
    plannedStreams,
    completedStreams,
    completionRate: calculateCompletionRate(plannedStreams, completedStreams),
    averageWatchDurationMinutes: calculateAverageWatchDuration(records),
    publishedClips: calculatePublishedClips(records),
  };
}

export function calculateChange(
  week1Value: number | null,
  week2Value: number | null,
): number | null {
  if (week1Value === null || week2Value === null) return null;
  return week2Value - week1Value;
}

export function buildCreatorAnalytics(
  creatorId: string,
  streams: StreamRecord[],
): CreatorWeeklyAnalytics {
  const creatorStreams = streams.filter((stream) => stream.creatorId === creatorId);
  const week1 = calculateWeeklyMetrics(
    creatorStreams.filter((stream) => getWeekNumber(stream.scheduledAt) === 1),
  );
  const week2 = calculateWeeklyMetrics(
    creatorStreams.filter((stream) => getWeekNumber(stream.scheduledAt) === 2),
  );

  return {
    creatorId,
    week1,
    week2,
    changes: {
      completionRateChange: calculateChange(week1.completionRate, week2.completionRate),
      averageWatchDurationChange: calculateChange(
        week1.averageWatchDurationMinutes,
        week2.averageWatchDurationMinutes,
      ),
      publishedClipsChange: calculateChange(week1.publishedClips, week2.publishedClips),
    },
  };
}

export function buildAllCreatorAnalytics(
  creators: Creator[],
  streams: StreamRecord[],
): CreatorWeeklyAnalytics[] {
  return creators.map((creator) => buildCreatorAnalytics(creator.id, streams));
}
