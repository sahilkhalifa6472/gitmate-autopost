export type Stats = Record<string, number>;

export type Item = {
  id: number;
  title: string;
  caption: string;
  video_url: string;
  cover_offset_ms: number;
  duration_sec?: number;
  slug?: string;
  link?: string;              // repo/link sent in DMs to people who comment the keyword
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
  reply_token?: string; // optional Facebook-Graph (EAA...) token used only for comments/DMs
  reply_token_at?: number;
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

// Comment-to-DM auto reply (like ManyChat), stored under "ar_config"
export type AutoReplyConfig = {
  enabled: boolean;           // comments -> DM
  dm_enabled: boolean;        // keyword in a DM -> reply with latest links
  keyword: string;            // matched case-insensitively anywhere in the comment
  dm_text: string;            // {username} {link} {title}
  dm_inbox_text: string;      // {username} {links}
  public_replies: string[];   // one is picked per comment
  default_link: string;       // used when a post has no link
  links: Record<string, string>; // media_id -> link (manual overrides from the dashboard)
  days: number;               // Instagram allows a private reply only within 7 days of the comment
  max_per_run: number;
  follow_gate?: boolean;
  gate_text?: string;         // {username} {title}
  follow_text?: string;       // {username} {account}      // ask "send me the link" first and only send it to followers
  last_run_at?: string;
  last_error?: string;
  sent_total?: number;
  webhook_at?: string;        // last Instagram webhook received (cron scans less while webhooks work)
  webhook_token?: string;     // "Verify token" pasted in the Meta app Webhooks section
};

export const DEFAULT_AR: AutoReplyConfig = {
  enabled: false,
  dm_enabled: false,
  keyword: "gitmate",
  dm_text: "Hey {username}! 👋 Here's the link you asked for:\n{link}\n\nFollow @git.mate for 1 useful repo every day 🤝",
  dm_inbox_text: "Hey {username}! 👋 Here are the latest repos from @git.mate:\n{links}\n\nWant a specific one? Just tell me which reel 🙌",
  public_replies: ["Sent it to your DMs 📩", "Check your DMs, mate 🤝", "Link's in your DMs 🔗", "Just DM'd you the link 🚀", "Done! Check your inbox 📬"],
  default_link: "",
  links: {},
  days: 7,
  max_per_run: 15,
  follow_gate: true,
};

export type ArEvent = { at: string; kind: "comment" | "dm"; username: string; text: string; media_id?: string; status: "sent" | "failed" | "skipped"; note?: string };
