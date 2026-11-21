export type Stats = Record<string, number>;

export type Item = {
  id: number;
  title: string;
  caption: string;
  video_url: string;
  cover_offset_ms: number;
  duration_sec?: number;
  slug?: string;
  added_at: string;
  status: "queued" | "posting" | "posted" | "failed" | "skipped";
  force?: boolean;            // "post now" from the dashboard
  tries?: number;
  error?: string;
  pending?: { container_id: string; started_at: string; window: number };
  media_id?: string;
  permalink?: string;
  posted_at?: string;
  window?: number;
  snapshot?: Stats;           // numbers at 12h, used to learn the best time
  latest?: Stats;
  stats_at?: number[];
  blob_deleted?: boolean;
};

export type Config = {
  ig_token?: string;
  ig_user_id?: string;
  username?: string;
  account_type?: string;
  token_refreshed_at?: number;
  timezone: string;
  windows: [number, number][];
  posts_per_day: number;
  paused: boolean;
  min_gap_min: number;
  explore: number;
  keep_video_days: number;
};

export type PlanSlot = { min: number; window: number; id?: number; skipped?: boolean; note?: string };

export const DEFAULT_CONFIG: Config = {
  timezone: "America/New_York",
  windows: [[7, 9], [9, 11], [11, 13], [13, 15], [15, 17], [17, 19], [19, 21], [21, 23]],
  posts_per_day: 1,
  paused: false,
  min_gap_min: 150,
  explore: 0.25,
  keep_video_days: 7,
};
