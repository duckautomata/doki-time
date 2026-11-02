/** Doki Time stays on UTC-7 all year. */
export const DOKI_OFFSET_MINUTES = -7 * 60;

/** IANA flips the sign on Etc zones: Etc/GMT+7 is UTC-7. Used only to format Doki Time for display. */
export const DOKI_ZONE = "Etc/GMT+7";
export const GMT_ZONE = "UTC";
export const JST_ZONE = "Asia/Tokyo";

export const MINUTE = 60 * 1000;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;

const pad = (n) => String(n).padStart(2, "0");

/**
 * Turns the Doki Time date and time inputs into a timestamp.
 * @param {string} date - "YYYY-MM-DD"
 * @param {string} time - "HH:mm" (seconds, if a browser adds them, are ignored)
 * @returns {number|null} epoch ms, or null when either value is missing or is not a real date or time
 */
export function dokiToInstant(date, time) {
    const dateMatch = /^(\d{4})-(\d{2})-(\d{2})$/.exec(date ?? "");
    const timeMatch = /^(\d{2}):(\d{2})(?::\d{2})?$/.exec(time ?? "");
    if (!dateMatch || !timeMatch) return null;

    const [year, month, day] = dateMatch.slice(1).map(Number);
    const [hour, minute] = timeMatch.slice(1).map(Number);
    if (hour > 23 || minute > 59) return null;

    const wallClock = Date.UTC(year, month - 1, day, hour, minute);
    // Date.UTC quietly rolls 2026-02-31 over into March, so check the date came back unchanged.
    const check = new Date(wallClock);
    if (check.getUTCFullYear() !== year || check.getUTCMonth() !== month - 1 || check.getUTCDate() !== day) {
        return null;
    }
    return wallClock - DOKI_OFFSET_MINUTES * MINUTE;
}

/**
 * The Doki Time date and time of a timestamp, in the formats the date and time inputs use.
 * @param {number} ms - epoch ms
 * @returns {{ date: string, time: string }}
 */
export function instantToDoki(ms) {
    const iso = new Date(ms + DOKI_OFFSET_MINUTES * MINUTE).toISOString();
    return { date: iso.slice(0, 10), time: iso.slice(11, 16) };
}

const wallClockFormatters = new Map();

/** The wall-clock time in `timeZone` at that moment, as if that wall-clock time were UTC. */
function wallClockInZone(ms, timeZone) {
    let formatter = wallClockFormatters.get(timeZone);
    if (!formatter) {
        formatter = new Intl.DateTimeFormat("en-US", {
            timeZone,
            hourCycle: "h23",
            year: "numeric",
            month: "numeric",
            day: "numeric",
            hour: "numeric",
            minute: "numeric",
            second: "numeric",
        });
        wallClockFormatters.set(timeZone, formatter);
    }
    const parts = Object.fromEntries(formatter.formatToParts(ms).map((part) => [part.type, Number(part.value)]));
    // Some engines still write midnight as hour 24 under h23.
    return Date.UTC(parts.year, parts.month - 1, parts.day, parts.hour % 24, parts.minute, parts.second);
}

/**
 * How many minutes `timeZone` is ahead of UTC at that moment. Worked out for the moment itself, so a date on
 * the other side of a daylight saving change gets that side's offset.
 * @returns {number} e.g. 540 for JST, -300 for New York in winter
 */
export function offsetMinutes(ms, timeZone) {
    return Math.round((wallClockInZone(ms, timeZone) - Math.floor(ms / 1000) * 1000) / MINUTE);
}

/**
 * @param {number} minutes - from offsetMinutes
 * @returns {string} "UTC+9", "UTC-7", "UTC+5:30" or "UTC+0"
 */
export function formatOffset(minutes) {
    const sign = minutes < 0 ? "-" : "+";
    const abs = Math.abs(minutes);
    const remainder = abs % 60;
    return `UTC${sign}${Math.floor(abs / 60)}${remainder ? `:${pad(remainder)}` : ""}`;
}

/**
 * Which calendar day the moment falls on in `timeZone`, compared with its Doki Time date.
 * @returns {number} 1 for the next day, -1 for the previous day, 0 for the same day
 */
export function dayDifference(ms, timeZone) {
    const zoneDay = Math.floor(wallClockInZone(ms, timeZone) / DAY);
    const dokiDay = Math.floor((ms + DOKI_OFFSET_MINUTES * MINUTE) / DAY);
    return zoneDay - dokiDay;
}

/** The browser's own zone, e.g. "America/New_York". */
export const localTimeZone = () => Intl.DateTimeFormat().resolvedOptions().timeZone;

/**
 * Whether the locale writes times on a 12-hour clock. The default for the 12h/24h toggle.
 * @param {string} [locale] - defaults to the browser's
 */
export function prefersHour12(locale) {
    const { hourCycle, hour12 } = new Intl.DateTimeFormat(locale, { hour: "numeric" }).resolvedOptions();
    if (hourCycle) return hourCycle === "h12" || hourCycle === "h11";
    return Boolean(hour12);
}

const hourCycleOptions = (hour12) => (hour12 ? { hourCycle: "h12" } : { hourCycle: "h23" });

/**
 * @param {number} ms
 * @param {string} timeZone
 * @param {object} options
 * @param {boolean} options.hour12
 * @param {boolean} [options.seconds] - shown while the page follows the live clock
 * @returns {string} "2:00 AM" or "02:00"
 */
export function formatTime(ms, timeZone, { hour12, seconds = false }) {
    return new Intl.DateTimeFormat(undefined, {
        timeZone,
        hour: hour12 ? "numeric" : "2-digit",
        minute: "2-digit",
        ...(seconds && { second: "2-digit" }),
        ...hourCycleOptions(hour12),
    }).format(ms);
}

/** @returns {string} e.g. "Fri, Nov 6, 2026" */
export function formatDate(ms, timeZone) {
    return new Intl.DateTimeFormat(undefined, {
        timeZone,
        weekday: "short",
        month: "short",
        day: "numeric",
        year: "numeric",
    }).format(ms);
}

/** Discord's timestamp styles, most used first. */
export const DISCORD_STYLES = [
    { style: "F", name: "Long date and time" },
    { style: "R", name: "Relative" },
    { style: "f", name: "Short date and time" },
    { style: "D", name: "Long date" },
    { style: "d", name: "Short date" },
    { style: "T", name: "Long time" },
    { style: "t", name: "Short time" },
];

/** @returns {string} e.g. "<t:1793930400:F>" */
export const discordTag = (ms, style) => `<t:${Math.floor(ms / 1000)}:${style}>`;

const RELATIVE_UNITS = [
    ["year", 365 * DAY],
    ["month", 30 * DAY],
    ["day", DAY],
    ["hour", HOUR],
    ["minute", MINUTE],
    ["second", 1000],
];

/** @returns {string} e.g. "in 4 days", "2 hours ago" or "now" */
export function formatRelative(ms, now, locale) {
    const diff = ms - now;
    const [unit, size] = RELATIVE_UNITS.find(([, size]) => Math.abs(diff) >= size) ?? RELATIVE_UNITS.at(-1);
    return new Intl.RelativeTimeFormat(locale, { numeric: "auto" }).format(Math.round(diff / size), unit);
}

/**
 * Roughly what Discord shows for a timestamp style. Discord renders it in each reader's own zone and locale,
 * so this uses the browser's, which is what the person copying it will see.
 * @param {number} ms
 * @param {string} style - one of DISCORD_STYLES
 * @param {object} options
 * @param {number} options.now - for the relative style
 * @param {boolean} options.hour12
 * @param {string} [options.locale]
 */
export function discordPreview(ms, style, { now, hour12, locale }) {
    const format = (options) => new Intl.DateTimeFormat(locale, options).format(ms);
    const hourCycle = hourCycleOptions(hour12);
    switch (style) {
        case "F":
            return format({ dateStyle: "full", timeStyle: "short", ...hourCycle });
        case "f":
            return format({ dateStyle: "long", timeStyle: "short", ...hourCycle });
        case "D":
            return format({ dateStyle: "long" });
        case "d":
            return format({ year: "numeric", month: "2-digit", day: "2-digit" });
        case "T":
            return format({ timeStyle: "medium", ...hourCycle });
        case "t":
            return format({ timeStyle: "short", ...hourCycle });
        case "R":
            return formatRelative(ms, now, locale);
        default:
            return "";
    }
}
