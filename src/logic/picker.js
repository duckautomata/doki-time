/**
 * Values for the day and time pickers. Dates are "YYYY-MM-DD" and times "HH:mm", both Doki Time, the same
 * strings the share link uses.
 */

const DAY = 24 * 60 * 60 * 1000;

const pad = (n) => String(n).padStart(2, "0");

/** "YYYY-MM-DD" as midnight UTC, so date maths never meets a time zone. */
const toMs = (date) => Date.parse(`${date}T00:00Z`);
const toDate = (ms) => new Date(ms).toISOString().slice(0, 10);

/** @returns {string} "YYYY-MM-DD" */
export const addDays = (date, days) => toDate(toMs(date) + days * DAY);

/** @returns {string} "YYYY-MM-DD", the Sunday on or before `date` */
export const sundayOf = (date) => addDays(date, -new Date(toMs(date)).getUTCDay());

/**
 * @param {string} month - "YYYY-MM"
 * @returns {string} "YYYY-MM"
 */
export function addMonths(month, months) {
    const [year, monthNumber] = month.split("-").map(Number);
    return new Date(Date.UTC(year, monthNumber - 1 + months, 1)).toISOString().slice(0, 7);
}

/** Formats a "YYYY-MM-DD" date in the visitor's language. */
export const formatDay = (date, options) =>
    new Intl.DateTimeFormat(undefined, { ...options, timeZone: "UTC" }).format(toMs(date));

/** @returns {number} 0 for Sunday through 6 for Saturday, from the visitor's locale */
export function firstDayOfWeek() {
    try {
        const locale = new Intl.Locale(navigator.language);
        const info = locale.getWeekInfo?.() ?? locale.weekInfo;
        if (info?.firstDay) return info.firstDay % 7;
    } catch {
        // Older browsers have no week info. Sunday it is.
    }
    return 0;
}

/** Weekday names in calendar column order. */
export const weekdayNames = (firstDay, weekday) =>
    Array.from({ length: 7 }, (_, i) =>
        // 2023-01-01 was a Sunday
        new Intl.DateTimeFormat(undefined, { weekday, timeZone: "UTC" }).format(
            Date.UTC(2023, 0, 1 + ((firstDay + i) % 7)),
        ),
    );

/**
 * The days of a month in calendar order, with null for the blank cells before the 1st.
 * @param {string} month - "YYYY-MM"
 * @param {number} firstDay - from firstDayOfWeek
 */
export function monthCells(month, firstDay) {
    const first = `${month}-01`;
    const blanks = (new Date(toMs(first)).getUTCDay() - firstDay + 7) % 7;
    const [year, monthNumber] = month.split("-").map(Number);
    const length = new Date(Date.UTC(year, monthNumber, 0)).getUTCDate();
    return [...Array(blanks).fill(null), ...Array.from({ length }, (_, i) => addDays(first, i))];
}

const splitTime = (time) => {
    const [hour, minute] = time.split(":").map(Number);
    return { hour, minute };
};
const joinTime = (hour, minute) => `${pad(hour)}:${pad(minute)}`;

/** The locale's word for AM or PM, e.g. "AM" or "午前". */
function dayPeriod(hour) {
    const parts = new Intl.DateTimeFormat(undefined, {
        hour: "numeric",
        hourCycle: "h12",
        timeZone: "UTC",
    }).formatToParts(Date.UTC(2023, 0, 1, hour));
    return parts.find((part) => part.type === "dayPeriod")?.value ?? (hour < 12 ? "AM" : "PM");
}

/** Hours for a list. On a 12-hour clock the value is the hour within the half day, 0 shown as 12. */
export const hourItems = (hour12) =>
    hour12
        ? Array.from({ length: 12 }, (_, value) => ({ value, label: String(value || 12) }))
        : Array.from({ length: 24 }, (_, value) => ({ value, label: pad(value) }));

/** Every 5 minutes, plus the current minute when it falls between them, e.g. live time or a typed 7:28. */
export function minuteItems(time) {
    const { minute } = splitTime(time);
    const minutes = Array.from({ length: 12 }, (_, i) => i * 5);
    if (!minutes.includes(minute)) minutes.push(minute);
    return minutes.sort((a, b) => a - b).map((value) => ({ value, label: pad(value) }));
}

export const periodItems = () => [
    { value: "AM", label: dayPeriod(0) },
    { value: "PM", label: dayPeriod(12) },
];

export const hourValue = (time, hour12) => (hour12 ? splitTime(time).hour % 12 : splitTime(time).hour);
export const minuteValue = (time) => splitTime(time).minute;
export const periodValue = (time) => (splitTime(time).hour < 12 ? "AM" : "PM");

/** Sets the hour from hourItems, keeping AM or PM on a 12-hour clock. */
export function withHour(time, value, hour12) {
    const { hour, minute } = splitTime(time);
    return joinTime(hour12 ? value + (hour >= 12 ? 12 : 0) : value, minute);
}

export const withMinute = (time, minute) => joinTime(splitTime(time).hour, minute);

export function withPeriod(time, period) {
    const { hour, minute } = splitTime(time);
    return joinTime((hour % 12) + (period === "PM" ? 12 : 0), minute);
}

/** @returns {string} "7:30 PM" or "19:30", which parseTypedTime reads back */
export function formatTypedTime(time, hour12) {
    const { hour, minute } = splitTime(time);
    return hour12 ? `${hour % 12 || 12}:${pad(minute)} ${hour < 12 ? "AM" : "PM"}` : joinTime(hour, minute);
}

/**
 * Reads a typed time: "7:30 pm", "7pm", "7.30p", "19:30" or "1930".
 * @param {string} text
 * @param {"AM" | "PM" | null} keepPeriod - on a 12-hour clock, the AM or PM to keep when none is typed.
 * null reads untagged times as 24-hour.
 * @returns {string | null} "HH:mm", or null when it isn't a time
 */
export function parseTypedTime(text, keepPeriod) {
    const match = /^(\d{1,2})(?:[:.]?(\d{2}))?\s*(?:([ap])\.?\s*m?\.?)?$/i.exec(text.trim());
    if (!match) return null;
    const hour = Number(match[1]);
    const minute = Number(match[2] ?? 0);
    if (minute > 59) return null;

    // "0:30" and "19:30" are 24-hour even on a 12-hour clock
    const period = match[3] ? `${match[3].toUpperCase()}M` : hour >= 1 && hour <= 12 ? keepPeriod : null;
    if (!period) return hour > 23 ? null : joinTime(hour, minute);
    if (hour < 1 || hour > 12) return null;
    return joinTime((hour % 12) + (period === "PM" ? 12 : 0), minute);
}
