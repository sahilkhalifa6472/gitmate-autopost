// Clock in the audience timezone (default New York), independent of the server's timezone.
export function tzParts(tz: string, ms = Date.now()) {
  const f = new Intl.DateTimeFormat("en-CA", { timeZone: tz, year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit", hourCycle: "h23" });
  const p = Object.fromEntries(f.formatToParts(new Date(ms)).map((x) => [x.type, x.value]));
  return { day: `${p.year}-${p.month}-${p.day}`, min: Number(p.hour) * 60 + Number(p.minute) };
}
export const hhmm = (min: number) => `${String(Math.floor(min / 60)).padStart(2, "0")}:${String(min % 60).padStart(2, "0")}`;

// Wall-clock time (day + minute in tz) -> UTC ms, for showing the same moment in IST.
export function tzToUtc(tz: string, day: string, min: number) {
  const guess = Date.UTC(+day.slice(0, 4), +day.slice(5, 7) - 1, +day.slice(8, 10), Math.floor(min / 60), min % 60);
  let t = guess;
  for (let i = 0; i < 3; i++) {
    const p = tzParts(tz, t);
    const diff = (Date.UTC(+p.day.slice(0, 4), +p.day.slice(5, 7) - 1, +p.day.slice(8, 10)) + p.min * 60e3) - guess;
    t -= diff;
  }
  return t;
}
export function fmtIn(tz: string, ms: number) {
  return new Intl.DateTimeFormat("en-GB", { timeZone: tz, day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit", hourCycle: "h23" }).format(new Date(ms));
}
