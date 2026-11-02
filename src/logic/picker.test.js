import { describe, expect, it } from "vitest";
import {
    addDays,
    addMonths,
    formatTypedTime,
    hourValue,
    minuteItems,
    monthCells,
    parseTypedTime,
    withHour,
    withMinute,
    withPeriod,
} from "./picker";

describe("addDays", () => {
    it("crosses months and years", () => {
        expect(addDays("2026-11-30", 1)).toBe("2026-12-01");
        expect(addDays("2026-12-31", 1)).toBe("2027-01-01");
        expect(addDays("2026-03-01", -1)).toBe("2026-02-28");
    });
});

describe("addMonths", () => {
    it("crosses years both ways", () => {
        expect(addMonths("2026-12", 1)).toBe("2027-01");
        expect(addMonths("2026-01", -1)).toBe("2025-12");
    });
});

describe("monthCells", () => {
    it("pads the first week to the locale's first day", () => {
        // November 2026 starts on a Sunday
        const sundayFirst = monthCells("2026-11", 0);
        expect(sundayFirst[0]).toBe("2026-11-01");
        expect(sundayFirst).toHaveLength(30);

        const mondayFirst = monthCells("2026-11", 1);
        expect(mondayFirst.slice(0, 7)).toEqual([null, null, null, null, null, null, "2026-11-01"]);
        expect(mondayFirst.at(-1)).toBe("2026-11-30");
    });

    it("knows February's length", () => {
        expect(monthCells("2028-02", 0).at(-1)).toBe("2028-02-29");
    });
});

describe("dropdown values", () => {
    it("lists every 5 minutes, plus an in-between current minute", () => {
        expect(minuteItems("19:00").map((item) => item.value)).toEqual([0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55]);
        expect(minuteItems("19:28").map((item) => item.label)).toContain("28");
        expect(minuteItems("19:28")).toHaveLength(13);
    });

    it("keeps AM or PM when the hour changes on a 12-hour clock", () => {
        expect(hourValue("19:30", true)).toBe(7);
        expect(withHour("19:30", 0, true)).toBe("12:30");
        expect(withHour("07:30", 0, true)).toBe("00:30");
        expect(withHour("19:30", 8, false)).toBe("08:30");
    });

    it("switches between AM and PM", () => {
        expect(withPeriod("19:30", "AM")).toBe("07:30");
        expect(withPeriod("00:15", "PM")).toBe("12:15");
        expect(withMinute("19:30", 5)).toBe("19:05");
    });
});

describe("parseTypedTime", () => {
    it.each([
        ["7:30 pm", "19:30"],
        ["7:30PM", "19:30"],
        ["7pm", "19:00"],
        ["7 p.m.", "19:00"],
        ["7.30a", "07:30"],
        ["12am", "00:00"],
        ["12:05 pm", "12:05"],
        ["19:30", "19:30"],
        ["1930", "19:30"],
        ["0:45", "00:45"],
        [" 07:08 ", "07:08"],
    ])("reads %j as %s", (text, expected) => {
        expect(parseTypedTime(text, null)).toBe(expected);
    });

    it("keeps the current AM or PM when none is typed on a 12-hour clock", () => {
        expect(parseTypedTime("8:15", "PM")).toBe("20:15");
        expect(parseTypedTime("12", "PM")).toBe("12:00");
        expect(parseTypedTime("8:15", "AM")).toBe("08:15");
        // Clearly 24-hour, whatever the clock
        expect(parseTypedTime("20:15", "AM")).toBe("20:15");
    });

    it.each(["", "7:", "7:5", "24:00", "7:60", "13pm", "0am", "seven", "7:30 xm"])("rejects %j", (text) => {
        expect(parseTypedTime(text, "PM")).toBeNull();
    });

    it("reads back what formatTypedTime writes", () => {
        for (const time of ["00:00", "07:05", "12:00", "19:30", "23:59"]) {
            expect(parseTypedTime(formatTypedTime(time, true), "AM")).toBe(time);
            expect(parseTypedTime(formatTypedTime(time, false), null)).toBe(time);
        }
    });
});

describe("formatTypedTime", () => {
    it("writes 12- and 24-hour times", () => {
        expect(formatTypedTime("19:30", true)).toBe("7:30 PM");
        expect(formatTypedTime("00:05", true)).toBe("12:05 AM");
        expect(formatTypedTime("07:05", false)).toBe("07:05");
    });
});
