export const metadata = { title: "git.mate · Privacy Policy" };

// Public page (not behind login): needed for the Meta app's Live mode
export default function Privacy() {
  return (
    <div className="wrap" style={{ maxWidth: 760, paddingTop: 32 }}>
      <div className="ph"><h1>Privacy Policy</h1></div>
      <div className="sub">git.mate (Instagram @git.mate) · last updated 12 Nov 2026</div>
      <div className="card" style={{ lineHeight: 1.7 }}>
        <p>This app is used only by the owner of the Instagram account @git.mate to schedule its own Reels and to answer people who comment on or message @git.mate.</p>
        <h2 style={{ marginTop: 18 }}>What we use</h2>
        <p>When you comment on a @git.mate post or send @git.mate a message, Instagram shares with this app your username, the text of your comment or message, and its time. We use this only to send you the link you asked for (for example after you comment &quot;GITMATE&quot;) and to reply to your message.</p>
        <h2 style={{ marginTop: 18 }}>What we keep</h2>
        <p>We keep the id of comments and messages we already answered, so we don&apos;t message you twice, and a short activity log (username, first 200 characters of the comment) for up to 90 days. We never sell or share this data, and we don&apos;t use it for ads.</p>
        <h2 style={{ marginTop: 18 }}>Deleting your data</h2>
        <p>To have your data removed, send a DM to @git.mate on Instagram with the word &quot;delete&quot;. See <a href="/data-deletion">data deletion</a>. We remove it within 7 days.</p>
      </div>
    </div>
  );
}
