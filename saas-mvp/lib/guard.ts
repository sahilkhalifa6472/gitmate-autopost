import { cookies } from "next/headers";
import { COOKIE, isLoggedIn } from "./auth";
export async function loggedIn() { return isLoggedIn((await cookies()).get(COOKIE)?.value); }
