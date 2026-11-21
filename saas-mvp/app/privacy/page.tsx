export default function Privacy() {
  return (
    <div className="wrap" style={{ maxWidth: 720, paddingTop: 32 }}>
      <h1>Privacy Policy</h1>
      <p className="sub">Last updated: 21 November 2026</p>
      <div className="card note">
        <p>This app lets the owner of an Instagram professional account schedule posts, send automatic replies to comments and direct messages, and read basic post insights for their own account.</p><br />
        <p><b>What we access:</b> your Instagram username and account id, your posts, comments on your posts, direct messages sent to your account, and post insights, only after you connect with Instagram.</p><br />
        <p><b>How we use it:</b> only to provide these features to you. Message text may be sent to our AI provider (Anthropic) to draft replies when you turn AI replies on. We do not sell or share your data for advertising.</p><br />
        <p><b>Storage:</b> access tokens and settings are stored in a private database and are never shown publicly. You can disconnect at any time from the dashboard, which deletes the stored token.</p><br />
        <p><b>Deletion:</b> see the <a href="/data-deletion">data deletion page</a>.</p>
      </div>
    </div>
  );
}
