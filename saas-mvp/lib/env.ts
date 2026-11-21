export const appUrl = (req?: Request) => (process.env.APP_URL || (req ? new URL(req.url).origin : "")).replace(/\/$/, "");
export const redirectUri = (req?: Request) => `${appUrl(req)}/api/ig/callback`;
