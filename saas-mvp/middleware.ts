import { NextRequest, NextResponse } from "next/server";
import { COOKIE, isLoggedIn } from "./lib/auth";

// pages need the login cookie; API routes check their own auth
export async function middleware(req: NextRequest) {
  if (await isLoggedIn(req.cookies.get(COOKIE)?.value)) return NextResponse.next();
  return NextResponse.redirect(new URL("/login", req.url));
}
export const config = { matcher: ["/", "/posts", "/rules", "/inbox", "/ai"] };
