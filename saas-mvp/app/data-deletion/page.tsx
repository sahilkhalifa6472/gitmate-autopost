export default function DataDeletion() {
  return (
    <div className="wrap" style={{ maxWidth: 720, paddingTop: 32 }}>
      <h1>Data deletion</h1>
      <div className="card note" style={{ marginTop: 16 }}>
        <p>To delete your data, open the dashboard and press <b>Disconnect</b> on your account. This removes your access token, rules and AI settings from our database right away.</p><br />
        <p>You can also remove the app from Instagram: Settings → Website permissions → Apps and websites → Remove. If you cannot log in, contact the app owner and we will delete your data within 7 days.</p>
      </div>
    </div>
  );
}
