export type StreamStatus = "completed" | "missed";

export interface Creator {
  id: string;
  name: string;
  handle: string;
}

export interface StreamRecord {
  id: string;
  creatorId: string;
  scheduledAt: string;
  status: StreamStatus;
  durationMinutes: number | null;
  uniqueViewers: number | null;
  averageWatchDurationMinutes: number | null;
  publishedClips: number | null;
}

export type WeekNumber = 1 | 2;

export interface WeeklyMetrics {
  plannedStreams: number;
  completedStreams: number;
  completionRate: number | null;
  averageWatchDurationMinutes: number | null;
  publishedClips: number | null;
}

export interface MetricChanges {
  completionRateChange: number | null;
  averageWatchDurationChange: number | null;
  publishedClipsChange: number | null;
}

export interface CreatorWeeklyAnalytics {
  creatorId: string;
  week1: WeeklyMetrics;
  week2: WeeklyMetrics;
  changes: MetricChanges;
}

export type AssessmentCategory =
  | "consistent_positive_progress"
  | "consistency_issue"
  | "insufficient_data";

export type AssessmentSignal =
  | "missing_week_data"
  | "completion_below_threshold"
  | "completion_drop"
  | "completion_increase"
  | "watch_duration_increase"
  | "clips_increase";

export interface Assessment {
  category: AssessmentCategory;
  evidence: string;
  evidenceItems: string[];
  nextAction: string;
  signals: AssessmentSignal[];
}

export interface CreatorAssessment {
  creatorId: string;
  assessment: Assessment | null;
}

export interface AverageResult {
  average: number | null;
  count: number;
}

export interface CreatorOverviewRow {
  creator: Creator;
  analytics: CreatorWeeklyAnalytics;
  assessment: Assessment | null;
}

export interface Overview {
  totalCreators: number;
  rows: CreatorOverviewRow[];
  week1CompletionRate: AverageResult;
  week2CompletionRate: AverageResult;
  positiveCount: number;
  consistencyIssueCount: number;
}
