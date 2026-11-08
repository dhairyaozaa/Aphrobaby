/**
 * Calendar-accurate age maths.
 *
 * Every value is derived from two absolute timestamps — the birth instant and
 * "now" — so the clock can never drift, no matter how long the page stays open.
 * Calendar fields are read in Aphrodite's time zone with Intl, and months are
 * counted as real calendar anniversaries (clamped for short months), never as
 * fixed 30-day blocks.
 */

export const DAY_MS = 86_400_000;

export interface ZonedParts {
  year: number;
  month: number;
  day: number;
  hour: number;
  minute: number;
  second: number;
}

export interface BirthInfo {
  date: string;
  time: string;
  timeZone: string;
}

export interface Age {
  valid: boolean;
  beforeBirth: boolean;
  years: number;
  months: number;
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  totalMonths: number;
  totalDays: number;
  totalHours: number;
  totalMinutes: number;
  totalSeconds: number;
  weeks: number;
  sunrises: number;
  nextBirthdayMs: number;
  untilBirthdayMs: number;
  birthMs: number;
}

const formatterCache = new Map<string, Intl.DateTimeFormat>();

function zonedFormatter(timeZone: string): Intl.DateTimeFormat {
  let formatter = formatterCache.get(timeZone);
  if (!formatter) {
    formatter = new Intl.DateTimeFormat('en-US', {
      timeZone,
      hourCycle: 'h23',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
    formatterCache.set(timeZone, formatter);
  }
  return formatter;
}

export function isValidTimeZone(timeZone: string): boolean {
  if (!timeZone) return false;
  try {
    new Intl.DateTimeFormat('en-US', { timeZone }).format(0);
    return true;
  } catch {
    return false;
  }
}

export function getTimeZoneOptions(): string[] {
  try {
    const supported = (
      Intl as unknown as { supportedValuesOf?: (key: string) => string[] }
    ).supportedValuesOf;
    if (typeof supported === 'function') return supported('timeZone');
  } catch {
    /* fall through to a curated list */
  }
  return [
    'Asia/Kolkata',
    'Asia/Kathmandu',
    'Asia/Dubai',
    'Asia/Singapore',
    'Asia/Tokyo',
    'Europe/London',
    'Europe/Paris',
    'Europe/Berlin',
    'America/New_York',
    'America/Chicago',
    'America/Denver',
    'America/Los_Angeles',
    'America/Sao_Paulo',
    'Australia/Sydney',
    'Pacific/Auckland',
    'UTC',
  ];
}

/** Calendar fields for an instant, in a given time zone. */
export function zonedParts(timestamp: number, timeZone: string): ZonedParts {
  const parts = zonedFormatter(timeZone).formatToParts(new Date(timestamp));
  const values: Record<string, number> = {};
  for (const part of parts) {
    if (part.type !== 'literal') values[part.type] = Number(part.value);
  }
  return {
    year: values.year,
    month: values.month,
    day: values.day,
    hour: values.hour,
    minute: values.minute,
    second: values.second,
  };
}

/** Offset (ms) of a time zone at a given instant, including DST. */
function zoneOffsetMs(timestamp: number, timeZone: string): number {
  const p = zonedParts(timestamp, timeZone);
  const asUtc = Date.UTC(p.year, p.month - 1, p.day, p.hour, p.minute, p.second);
  return asUtc - Math.floor(timestamp / 1000) * 1000;
}

/** Convert a wall-clock reading in a time zone into an absolute timestamp. */
export function wallTimeToTimestamp(
  year: number,
  month: number,
  day: number,
  hour: number,
  minute: number,
  second: number,
  timeZone: string,
): number {
  const wall = Date.UTC(year, month - 1, day, hour, minute, second);
  let timestamp = wall - zoneOffsetMs(wall, timeZone);
  for (let i = 0; i < 3; i += 1) {
    const corrected = wall - zoneOffsetMs(timestamp, timeZone);
    if (corrected === timestamp) break;
    timestamp = corrected;
  }
  return timestamp;
}

export function daysInMonth(year: number, month: number): number {
  return new Date(Date.UTC(year, month, 0)).getUTCDate();
}

export function isValidDateString(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const [y, m, d] = value.split('-').map(Number);
  return m >= 1 && m <= 12 && d >= 1 && d <= daysInMonth(y, m) && y >= 1900 && y <= 2200;
}

export function isValidTimeString(value: string): boolean {
  return /^([01]\d|2[0-3]):[0-5]\d(:[0-5]\d)?$/.test(value);
}

export function parseBirth(birth: BirthInfo): { year: number; month: number; day: number; hour: number; minute: number; second: number } | null {
  if (!isValidDateString(birth.date) || !isValidTimeString(birth.time) || !isValidTimeZone(birth.timeZone)) {
    return null;
  }
  const [year, month, day] = birth.date.split('-').map(Number);
  const timeParts = birth.time.split(':').map(Number);
  return {
    year,
    month,
    day,
    hour: timeParts[0] ?? 0,
    minute: timeParts[1] ?? 0,
    second: timeParts[2] ?? 0,
  };
}

export function birthTimestamp(birth: BirthInfo): number {
  const parsed = parseBirth(birth);
  if (!parsed) return NaN;
  return wallTimeToTimestamp(
    parsed.year,
    parsed.month,
    parsed.day,
    parsed.hour,
    parsed.minute,
    parsed.second,
    birth.timeZone,
  );
}

function addMonthsParts(
  base: { year: number; month: number; day: number },
  months: number,
): { year: number; month: number; day: number } {
  const total = base.month - 1 + months;
  const year = base.year + Math.floor(total / 12);
  const month = ((total % 12) + 12) % 12 + 1;
  const day = Math.min(base.day, daysInMonth(year, month));
  return { year, month, day };
}

function anniversaryTimestamp(
  base: { year: number; month: number; day: number; hour: number; minute: number; second: number },
  months: number,
  timeZone: string,
): number {
  const date = addMonthsParts(base, months);
  return wallTimeToTimestamp(date.year, date.month, date.day, base.hour, base.minute, base.second, timeZone);
}

function nextBirthdayTimestamp(
  base: { year: number; month: number; day: number; hour: number; minute: number; second: number },
  nowParts: ZonedParts,
  nowMs: number,
  timeZone: string,
): number {
  const makeFor = (year: number) => {
    const day = Math.min(base.day, daysInMonth(year, base.month));
    return wallTimeToTimestamp(year, base.month, day, base.hour, base.minute, base.second, timeZone);
  };
  let candidate = makeFor(nowParts.year);
  if (candidate <= nowMs) candidate = makeFor(nowParts.year + 1);
  return candidate;
}

/** Calendar day number (days since epoch) for a YYYY-MM-DD string or zoned parts. */
export function dayNumber(year: number, month: number, day: number): number {
  return Math.round(Date.UTC(year, month - 1, day) / DAY_MS);
}

export function computeAge(birth: BirthInfo, nowMs: number): Age {
  const parsed = parseBirth(birth);
  if (!parsed) {
    return emptyAge(NaN);
  }
  const tz = birth.timeZone;
  const birthMs = wallTimeToTimestamp(
    parsed.year,
    parsed.month,
    parsed.day,
    parsed.hour,
    parsed.minute,
    parsed.second,
    tz,
  );
  if (!Number.isFinite(birthMs) || nowMs < birthMs) {
    const age = emptyAge(birthMs);
    age.beforeBirth = Number.isFinite(birthMs) && nowMs < birthMs;
    age.nextBirthdayMs = birthMs;
    age.untilBirthdayMs = Math.max(0, birthMs - nowMs);
    return age;
  }

  const nowParts = zonedParts(nowMs, tz);

  // Largest number of complete calendar months elapsed.
  let months = (nowParts.year - parsed.year) * 12 + (nowParts.month - parsed.month);
  if (months < 0) months = 0;
  while (months > 0 && anniversaryTimestamp(parsed, months, tz) > nowMs) months -= 1;
  while (anniversaryTimestamp(parsed, months + 1, tz) <= nowMs) months += 1;

  // Count the remainder in calendar terms, so a day stays a date even when a
  // time zone's daylight-saving shift makes it 23 or 25 hours long.
  const anchor = anniversaryTimestamp(parsed, months, tz);
  const anchorParts = zonedParts(anchor, tz);
  let days =
    dayNumber(nowParts.year, nowParts.month, nowParts.day) -
    dayNumber(anchorParts.year, anchorParts.month, anchorParts.day);
  let hours = nowParts.hour - anchorParts.hour;
  let minutes = nowParts.minute - anchorParts.minute;
  let seconds = nowParts.second - anchorParts.second;
  if (seconds < 0) {
    seconds += 60;
    minutes -= 1;
  }
  if (minutes < 0) {
    minutes += 60;
    hours -= 1;
  }
  if (hours < 0) {
    hours += 24;
    days -= 1;
  }
  if (days < 0) days = 0;

  const elapsed = nowMs - birthMs;
  const totalDays = Math.floor(elapsed / DAY_MS);
  const nextBirthdayMs = nextBirthdayTimestamp(parsed, nowParts, nowMs, tz);

  const birthDayNumber = dayNumber(parsed.year, parsed.month, parsed.day);
  const todayNumber = dayNumber(nowParts.year, nowParts.month, nowParts.day);

  return {
    valid: true,
    beforeBirth: false,
    years: Math.floor(months / 12),
    months: months % 12,
    days,
    hours,
    minutes,
    seconds,
    totalMonths: months,
    totalDays,
    totalHours: Math.floor(elapsed / 3_600_000),
    totalMinutes: Math.floor(elapsed / 60_000),
    totalSeconds: Math.floor(elapsed / 1000),
    weeks: Math.floor(totalDays / 7),
    sunrises: Math.max(1, todayNumber - birthDayNumber + 1),
    nextBirthdayMs,
    untilBirthdayMs: Math.max(0, nextBirthdayMs - nowMs),
    birthMs,
  };
}

function emptyAge(birthMs: number): Age {
  return {
    valid: false,
    beforeBirth: false,
    years: 0,
    months: 0,
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
    totalMonths: 0,
    totalDays: 0,
    totalHours: 0,
    totalMinutes: 0,
    totalSeconds: 0,
    weeks: 0,
    sunrises: 0,
    nextBirthdayMs: birthMs,
    untilBirthdayMs: 0,
    birthMs,
  };
}

/** Split a duration into d/h/m/s for countdowns. */
export function splitDuration(ms: number): { days: number; hours: number; minutes: number; seconds: number } {
  const safe = Math.max(0, ms);
  return {
    days: Math.floor(safe / DAY_MS),
    hours: Math.floor((safe % DAY_MS) / 3_600_000),
    minutes: Math.floor((safe % 3_600_000) / 60_000),
    seconds: Math.floor((safe % 60_000) / 1000),
  };
}

/** Add days to a YYYY-MM-DD calendar date, in UTC to avoid locale shifts. */
export function addDaysISO(date: string, days: number): string {
  const [y, m, d] = date.split('-').map(Number);
  const next = new Date(Date.UTC(y, m - 1, d + days));
  return next.toISOString().slice(0, 10);
}

export function addMonthsISO(date: string, months: number): string {
  const [y, m, d] = date.split('-').map(Number);
  const total = m - 1 + months;
  const year = y + Math.floor(total / 12);
  const month = ((total % 12) + 12) % 12 + 1;
  const day = Math.min(d, daysInMonth(year, month));
  return `${String(year).padStart(4, '0')}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

export function dateParts(date: string): { year: number; month: number; day: number } {
  const [year, month, day] = date.split('-').map(Number);
  return { year, month, day };
}

const MONTHS_LONG = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

const MONTHS_SHORT = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export function formatDateLong(date: string): string {
  if (!isValidDateString(date)) return '—';
  const { year, month, day } = dateParts(date);
  return `${String(day).padStart(2, '0')} ${MONTHS_LONG[month - 1]} ${year}`;
}

export function formatDateShort(date: string): string {
  if (!isValidDateString(date)) return '—';
  const { year, month, day } = dateParts(date);
  return `${String(day).padStart(2, '0')} ${MONTHS_SHORT[month - 1]} ${year}`;
}

export function formatDayMonth(date: string): { day: string; month: string; year: string } {
  if (!isValidDateString(date)) return { day: '—', month: '', year: '' };
  const { year, month, day } = dateParts(date);
  return {
    day: String(day).padStart(2, '0'),
    month: MONTHS_LONG[month - 1],
    year: String(year),
  };
}

/** Whole calendar days from `from` to `to` (positive when `to` is later). */
export function calendarDaysBetween(from: string, to: string): number {
  const a = dateParts(from);
  const b = dateParts(to);
  return dayNumber(b.year, b.month, b.day) - dayNumber(a.year, a.month, a.day);
}

export function relativeDayLabel(date: string, todayISO: string): string {
  const diff = calendarDaysBetween(todayISO, date);
  if (diff === 0) return 'Today';
  if (diff === 1) return 'Tomorrow';
  if (diff === -1) return 'Yesterday';
  if (diff > 1 && diff < 14) return `In ${diff} days`;
  if (diff < -1 && diff > -14) return `${Math.abs(diff)} days ago`;
  if (diff >= 14 && diff < 60) return `In ${Math.round(diff / 7)} weeks`;
  if (diff <= -14 && diff > -60) return `${Math.round(Math.abs(diff) / 7)} weeks ago`;
  if (diff >= 60) return `In ${Math.round(diff / 30)} months`;
  return `${Math.round(Math.abs(diff) / 30)} months ago`;
}

/** Today's date in a given time zone, as YYYY-MM-DD. */
export function todayISO(timeZone: string, nowMs: number = Date.now()): string {
  const zone = isValidTimeZone(timeZone) ? timeZone : 'UTC';
  const p = zonedParts(nowMs, zone);
  return `${String(p.year).padStart(4, '0')}-${String(p.month).padStart(2, '0')}-${String(p.day).padStart(2, '0')}`;
}

export function timeZoneLabel(timeZone: string, nowMs: number = Date.now()): string {
  try {
    const parts = new Intl.DateTimeFormat('en-US', {
      timeZone,
      timeZoneName: 'shortOffset',
    }).formatToParts(new Date(nowMs));
    return parts.find((p) => p.type === 'timeZoneName')?.value ?? timeZone;
  } catch {
    return timeZone;
  }
}

export function formatClockTime(time: string): string {
  if (!isValidTimeString(time)) return '—';
  const [hour, minute] = time.split(':').map(Number);
  const suffix = hour >= 12 ? 'PM' : 'AM';
  const displayHour = hour % 12 === 0 ? 12 : hour % 12;
  return `${displayHour}:${String(minute).padStart(2, '0')} ${suffix}`;
}

export function pad(value: number, length = 2): string {
  return String(Math.max(0, value)).padStart(length, '0');
}

export function formatNumber(value: number): string {
  return Math.max(0, Math.floor(value)).toLocaleString('en-US');
}
