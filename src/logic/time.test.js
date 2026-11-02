import { describe, expect, it } from "vitest";
import {
    DOKI_ZONE,
    GMT_ZONE,
    JST_ZONE,
    dayDifference,
    discordPreview,
    discordTag,
    dokiToInstant,
    formatOffset,
    formatRelative,
    instantToDoki,
    offsetMinutes,
    prefersHour12,
} from "./time";

const DAY = 24 * 60 * 60 * 1000;

describe("dokiToInstant", () => {
    it("reads the inputs as UTC-7", () => {
        expect(dokiToInstant("2026-11-05", "19:00")).toBe(Date.UTC(2026, 10, 6, 2, 0));
    });

    it("stays UTC-7 in summer and winter", () => {
        expect(dokiToInstant("2026-07-01", "12:00")).toBe(Date.UTC(2026, 6, 1, 19, 0));
        expect(dokiToInstant("2026-01-01", "12:00")).toBe(Date.UTC(2026, 0, 1, 19, 0));
    });

    it("ignores seconds a browser adds to the time", () => {
        expect(dokiToInstant("2026-11-05", "19:00:30")).toBe(dokiToInstant("2026-11-05", "19:00"));
    });

    it.each([
        ["", "19:00"],
        ["2026-11-05", ""],
        [null, null],
        ["2026-02-31", "19:00"],
        ["2026-13-01", "19:00"],
        ["2026-11-05", "24:00"],
        ["2026-11-05", "19:60"],
        ["5/11/2026", "19:00"],
    ])("rejects %j %j", (date, time) => {
        expect(dokiToInstant(date, time)).toBeNull();
    });
});

describe("instantToDoki", () => {
    it("is the reverse of dokiToInstant", () => {
        expect(instantToDoki(Date.UTC(2026, 10, 6, 2, 0))).toEqual({ date: "2026-11-05", time: "19:00" });
    });

    it("drops seconds", () => {
        expect(instantToDoki(Date.UTC(2026, 10, 6, 2, 0, 59, 999))).toEqual({ date: "2026-11-05", time: "19:00" });
    });
});

describe("dayDifference", () => {
    const at = (time, date = "2026-11-05") => dokiToInstant(date, time);

    it("puts JST on the next day from 08:00 Doki Time", () => {
        expect(dayDifference(at("07:59"), JST_ZONE)).toBe(0);
        expect(dayDifference(at("08:00"), JST_ZONE)).toBe(1);
        expect(dayDifference(at("23:59"), JST_ZONE)).toBe(1);
    });

    it("puts GMT on the next day from 17:00 Doki Time", () => {
        expect(dayDifference(at("16:59"), GMT_ZONE)).toBe(0);
        expect(dayDifference(at("17:00"), GMT_ZONE)).toBe(1);
    });

    it("puts zones west of Doki Time on the previous day", () => {
        // Honolulu is UTC-10, three hours behind
        expect(dayDifference(at("01:00"), "Pacific/Honolulu")).toBe(-1);
        expect(dayDifference(at("03:00"), "Pacific/Honolulu")).toBe(0);
    });

    it("follows daylight saving in the zone it converts to", () => {
        // 21:00 Doki Time is midnight in New York on daylight time (UTC-4) but 23:00 on standard time (UTC-5)
        expect(dayDifference(at("21:00", "2026-10-31"), "America/New_York")).toBe(1);
        expect(dayDifference(at("21:00", "2026-11-02"), "America/New_York")).toBe(0);
    });

    it("is 0 in Doki Time itself", () => {
        expect(dayDifference(at("00:00"), DOKI_ZONE)).toBe(0);
        expect(dayDifference(at("23:59"), DOKI_ZONE)).toBe(0);
    });
});

describe("offsetMinutes", () => {
    it("reads fixed offsets", () => {
        const ms = dokiToInstant("2026-11-05", "19:00");
        expect(offsetMinutes(ms, DOKI_ZONE)).toBe(-420);
        expect(offsetMinutes(ms, GMT_ZONE)).toBe(0);
        expect(offsetMinutes(ms, JST_ZONE)).toBe(540);
        expect(offsetMinutes(ms, "Asia/Kolkata")).toBe(330);
    });

    it("uses the offset in force on the date, not today's", () => {
        // US daylight saving ends 2026-11-01
        expect(offsetMinutes(dokiToInstant("2026-10-31", "19:00"), "America/New_York")).toBe(-240);
        expect(offsetMinutes(dokiToInstant("2026-11-02", "19:00"), "America/New_York")).toBe(-300);
    });
});

describe("formatOffset", () => {
    it.each([
        [0, "UTC+0"],
        [540, "UTC+9"],
        [-420, "UTC-7"],
        [330, "UTC+5:30"],
        [-570, "UTC-9:30"],
    ])("formats %i as %s", (minutes, expected) => {
        expect(formatOffset(minutes)).toBe(expected);
    });
});

describe("prefersHour12", () => {
    it("follows the locale", () => {
        expect(prefersHour12("en-US")).toBe(true);
        expect(prefersHour12("en-GB")).toBe(false);
        expect(prefersHour12("ja-JP")).toBe(false);
    });
});

describe("discord", () => {
    const ms = Date.UTC(2026, 10, 6, 2, 0);

    it("builds a tag in whole seconds", () => {
        expect(discordTag(ms, "F")).toBe("<t:1793930400:F>");
        expect(discordTag(ms + 999, "R")).toBe("<t:1793930400:R>");
    });

    it("previews the relative style", () => {
        expect(discordPreview(ms, "R", { now: ms - 4 * DAY, hour12: true, locale: "en" })).toBe("in 4 days");
    });
});

describe("formatRelative", () => {
    const now = Date.UTC(2026, 10, 1, 12, 0);

    it.each([
        [0, "now"],
        [30 * 1000, "in 30 seconds"],
        [-2 * 60 * 60 * 1000, "2 hours ago"],
        [DAY, "tomorrow"],
        [4 * DAY, "in 4 days"],
        [60 * DAY, "in 2 months"],
    ])("formats %i ms from now", (diff, expected) => {
        expect(formatRelative(now + diff, now, "en")).toBe(expected);
    });
});
