import Link from "next/link";
import type { Account } from "@/lib/data";
// account switcher chips (keeps you on the same page)
export default function Accounts({ list, acc, path }: { list: Account[]; acc?: Account; path: string }) {
  if (list.length < 2) return null;
  return <div className="chips">{list.map((x) => <Link key={x.id} href={`${path}?a=${x.id}`} className={`pill${x.id === acc?.id ? " solid" : ""}`} style={{ textDecoration: "none" }}>@{x.username}</Link>)}</div>;
}
