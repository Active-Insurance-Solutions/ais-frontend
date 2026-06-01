// Business hours with an automatic seasonal override.
//
// The client runs a reduced summer schedule (closed Fridays) for June & July
// 2026, then reverts to the regular Monday–Friday schedule. Rather than relying
// on a manual content swap or a scheduled task that could fail to fire, the
// switch is computed from the current date here — the site simply shows the
// right schedule and "expires" the summer hours automatically on Aug 1, 2026.
//
// ── To change the schedule ──
//   • Edit REGULAR_HOURS / SUMMER_HOURS below for different times.
//   • Edit SUMMER_START / SUMMER_END for a different window.
//   • To make the summer schedule recurring every year instead of one-time,
//     replace the fixed-date check in `isSummerHours()` with a month check
//     (e.g. `const m = now.getMonth(); return m === 5 || m === 6;`).
//
// Dates use Mountain Time implicitly via the visitor's clock; the few hours of
// ambiguity around the midnight boundaries on Jun 1 / Aug 1 are immaterial for
// a business-hours display.

export interface HoursRow {
  days: string;
  time: string;
}

// Month is 0-indexed: 5 = June, 7 = August.
const SUMMER_START = new Date(2026, 5, 1); // 2026-06-01 00:00 local
const SUMMER_END = new Date(2026, 7, 1); // 2026-08-01 00:00 local (exclusive)

const REGULAR_HOURS: HoursRow[] = [
  { days: 'Monday – Friday', time: '8:00 AM – 5:00 PM' },
];

const SUMMER_HOURS: HoursRow[] = [
  { days: 'Monday – Thursday', time: '8:00 AM – 5:00 PM' },
  { days: 'Friday', time: 'Closed' },
];

export function isSummerHours(now: Date = new Date()): boolean {
  return now >= SUMMER_START && now < SUMMER_END;
}

export function useBusinessHours(now: Date = new Date()) {
  const summer = isSummerHours(now);
  return {
    isSummer: summer,
    hours: summer ? SUMMER_HOURS : REGULAR_HOURS,
  };
}
