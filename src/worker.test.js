// @vitest-environment node
import { describe, expect, it, vi } from "vitest";
import worker from "./worker";

const env = (status = 200) => ({ ASSETS: { fetch: vi.fn(async () => new Response("asset", { status })) } });
const get = (path, assets = env()) => worker.fetch(new Request(`https://www.duck-automata.com${path}`), assets);

describe("worker", () => {
    it("sends the server's clock without caching it", async () => {
        const before = Date.now();
        const response = await get("/doki-time/api/time");
        const { now } = await response.json();

        expect(response.headers.get("Cache-Control")).toBe("no-store");
        expect(now).toBeGreaterThanOrEqual(before);
        expect(now).toBeLessThanOrEqual(Date.now());
    });

    it("adds the trailing slash", async () => {
        const response = await get("/doki-time");
        expect(response.status).toBe(301);
        expect(response.headers.get("Location")).toBe("https://www.duck-automata.com/doki-time/");
    });

    it("falls back to the page for unknown paths", async () => {
        const assets = env(404);
        await get("/doki-time/somewhere", assets);
        expect(assets.ASSETS.fetch).toHaveBeenLastCalledWith(
            expect.objectContaining({ url: "https://www.duck-automata.com/doki-time/" }),
        );
    });

    it("keeps 404s for missing files", async () => {
        const response = await get("/doki-time/missing.png", env(404));
        expect(response.status).toBe(404);
    });
});
