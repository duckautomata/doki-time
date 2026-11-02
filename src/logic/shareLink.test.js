import { describe, expect, it } from "vitest";
import { readShareParams, shareUrl } from "./shareLink";

describe("readShareParams", () => {
    it("reads a shared Doki Time", () => {
        expect(readShareParams("?d=2026-11-05&t=19:00")).toEqual({ date: "2026-11-05", time: "19:00" });
    });

    it.each(["", "?d=2026-11-05", "?t=19:00", "?d=2026-02-31&t=19:00", "?d=tomorrow&t=7pm"])("ignores %j", (search) => {
        expect(readShareParams(search)).toBeNull();
    });
});

describe("shareUrl", () => {
    const selection = { date: "2026-11-05", time: "19:00" };

    it("links to the time on the page", () => {
        const url = shareUrl("https://www.duck-automata.com/doki-time/", "/doki-time/", selection);
        expect(url).toBe("https://www.duck-automata.com/doki-time/?d=2026-11-05&t=19%3A00");
        expect(readShareParams(new URL(url).search)).toEqual(selection);
    });

    it("drops any other path, parameters and #hash", () => {
        const messy = "https://www.duck-automata.com/doki-time/something-else/?ref=discord&d=2026-01-01&t=01:00#top";
        expect(shareUrl(messy, "/doki-time/", selection)).toBe(
            "https://www.duck-automata.com/doki-time/?d=2026-11-05&t=19%3A00",
        );
        expect(shareUrl(messy, "/doki-time/", null)).toBe("https://www.duck-automata.com/doki-time/");
    });

    it("adds the trailing slash", () => {
        expect(shareUrl("https://dev.duck-automata.com/doki-time", "/doki-time/", null)).toBe(
            "https://dev.duck-automata.com/doki-time/",
        );
    });
});
