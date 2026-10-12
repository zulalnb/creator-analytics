import { assessAllCreators } from "./assessment";
import { buildAllCreatorAnalytics } from "./analytics";
import type {
  AverageResult,
  Creator,
  CreatorOverviewRow,
  Overview,
  StreamRecord,
} from "./types";

export function averageOfAvailable(values: (number | null)[]): AverageResult {
  const available = values.filter(
    (value): value is number => value !== null && Number.isFinite(value),
  );
  if (available.length === 0) return { average: null, count: 0 };

  return {
    average: available.reduce((sum, value) => sum + value, 0) / available.length,
    count: available.length,
  };
}

export function buildOverview(creators: Creator[], streams: StreamRecord[]): Overview {
  const analytics = buildAllCreatorAnalytics(creators, streams);
  const assessments = assessAllCreators(analytics);

  const rows: CreatorOverviewRow[] = creators.map((creator, index) => ({
    creator,
    analytics: analytics[index],
    assessment: assessments[index].assessment,
  }));

  const countCategory = (category: string) =>
    rows.filter((row) => row.assessment?.category === category).length;

  return {
    totalCreators: creators.length,
    rows,
    week1CompletionRate: averageOfAvailable(rows.map((row) => row.analytics.week1.completionRate)),
    week2CompletionRate: averageOfAvailable(rows.map((row) => row.analytics.week2.completionRate)),
    positiveCount: countCategory("consistent_positive_progress"),
    consistencyIssueCount: countCategory("consistency_issue"),
  };
}
