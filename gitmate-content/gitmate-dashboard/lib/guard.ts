import { cookies } from "next/headers";
import { COOKIE, isLoggedIn, hasUploadToken } from "./auth";

export async function loggedIn() {
  return isLoggedIn((await cookies()).get(COOKIE)?.value);
}
export async function allowed(req: Request) {
  return (await loggedIn()) || hasUploadToken(req.headers.get("x-upload-token"));
}
export const deny = () => Response.json({ error: "unauthorized" }, { status: 401 });
