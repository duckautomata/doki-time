import { afterEach, describe, expect, it, vi } from "vitest";
import { clockStatus, estimateOffset, formatDuration, measureClockOffset } from "./clockSync";

describe("estimateOffset", () => {
    it("trusts the quickest round trip", () => {
        const samples = [
            { sent: 1000, received: 1400, server: 1500 },
            { sent: 2000, received: 2040, server: 2520 },
            { sent: 3000, received: 3100, server: 3600 },
        ];
        // The 40ms trip: the server read 2520 when this device read about 2020
        expect(estimateOffset(samples)).toEqual({ offset: 500, uncertainty: 20 });
    });

    it("is negative when this device is ahead", () => {
        expect(estimateOffset([{ sent: 5000, received: 5010, server: 3005 }]).offset).toBe(-2000);
    });
});

describe("measureClockOffset", () => {
    afterEach(() => {
        vi.useRealTimers();
    });

    it("measures against the server's clock", async () => {
        vi.useFakeTimers({ now: 10_000, toFake: ["Date"] });
        // A server 3s ahead of this device, 20ms away each way
        const fetchImpl = vi.fn(async () => {
            vi.advanceTimersByTime(20);
            const server = Date.now() + 3000;
            vi.advanceTimersByTime(20);
            return { ok: true, json: async () => ({ now: server }) };
        });

        const result = await measureClockOffset({ url: "/doki-time/api/time", samples: 3, fetchImpl });

        expect(fetchImpl).toHaveBeenCalledTimes(3);
        expect(fetchImpl).toHaveBeenCalledWith("/doki-time/api/time", { cache: "no-store" });
        expect(result).toEqual({ offset: 3000, uncertainty: 20 });
    });

    it("fails when the server errors", async () => {
        const fetchImpl = vi.fn(async () => ({ ok: false, status: 503 }));
        await expect(measureClockOffset({ url: "/api/time", fetchImpl })).rejects.toThrow("503");
    });

    it("fails when the server sends no time", async () => {
        const fetchImpl = vi.fn(async () => ({ ok: true, json: async () => ({}) }));
        await expect(measureClockOffset({ url: "/api/time", fetchImpl })).rejects.toThrow();
    });
});

describe("clockStatus", () => {
    it.each([
        [0, "synced"],
        [-499, "synced"],
        [500, "close"],
        [-1999, "close"],
        [2000, "off"],
        [-90_000, "off"],
    ])("calls %i ms %s", (offset, expected) => {
        expect(clockStatus(offset)).toBe(expected);
    });
});

describe("formatDuration", () => {
    it.each([
        [120, "120ms"],
        [2.4, "2ms"],
        [-4321, "4.3s"],
        [200_000, "3m 20s"],
        [7_500_000, "2h 5m"],
    ])("formats %i ms as %s", (ms, expected) => {
        expect(formatDuration(ms)).toBe(expected);
    });
});
