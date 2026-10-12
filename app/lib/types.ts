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
