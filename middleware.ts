import { NextRequest, NextResponse } from "next/server";
import { COOKIE, isLoggedIn } from "./lib/auth";

// API routes check their own auth (cron secret / upload token / cookie)
export async function middleware(req: NextRequest) {
  if (await isLoggedIn(req.cookies.get(COOKIE)?.value)) return NextResponse.next();
  return NextResponse.redirect(new URL("/login", req.url));
}

export const config = { matcher: ["/", "/queue", "/logs", "/settings"] };
