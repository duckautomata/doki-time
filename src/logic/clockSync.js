/**
 * Estimates how far this device's clock is from the server's.
 *
 * Each sample is one round trip to the time endpoint: `sent` and `received` are this device's clock, `server`
 * is the server's clock somewhere in between. Assuming it was stamped halfway through, the guess is off by at
 * most half the round trip, so the quickest round trip gives the most trustworthy answer.
 * @param {{ sent: number, received: number, server: number }[]} samples - epoch ms
 * @returns {{ offset: number, uncertainty: number }} ms. `offset` is server minus device: positive means the
 * device is behind.
 */
export function estimateOffset(samples) {
    const best = samples.reduce((a, b) => (b.received - b.sent < a.received - a.sent ? b : a));
    const roundTrip = best.received - best.sent;
    return { offset: best.server - (best.sent + roundTrip / 2), uncertainty: roundTrip / 2 };
}

/**
 * Asks the time endpoint for the server's clock a few times in a row and estimates this device's offset.
 * The first round trip usually includes setting up the connection, which is why one is not enough.
 * @param {object} options
 * @param {string} options.url - the endpoint, which answers `{ "now": <epoch ms> }`
 * @param {number} [options.samples]
 * @param {typeof fetch} [options.fetchImpl]
 */
export async function measureClockOffset({ url, samples = 5, fetchImpl = fetch }) {
    const results = [];
    for (let i = 0; i < samples; i++) {
        const sent = Date.now();
        const response = await fetchImpl(url, { cache: "no-store" });
        const received = Date.now();
        if (!response.ok) {
            throw new Error(`The time server answered ${response.status}`);
        }
        const { now } = await response.json();
        if (typeof now !== "number") {
            throw new Error("The time server did not send a time");
        }
        results.push({ sent, received, server: now });
    }
    return estimateOffset(results);
}

/**
 * @param {number} offset - from estimateOffset
 * @returns {"synced" | "close" | "off"} synced under half a second, close under two seconds
 */
export function clockStatus(offset) {
    const abs = Math.abs(offset);
    if (abs < 500) return "synced";
    if (abs < 2000) return "close";
    return "off";
}

/** @returns {string} "120ms", "4.3s", "3m 20s" or "2h 5m" */
export function formatDuration(ms) {
    const abs = Math.abs(ms);
    if (abs < 1000) return `${Math.round(abs)}ms`;
    if (abs < 60 * 1000) return `${(abs / 1000).toFixed(1)}s`;
    const totalSeconds = Math.round(abs / 1000);
    if (totalSeconds < 60 * 60) return `${Math.floor(totalSeconds / 60)}m ${totalSeconds % 60}s`;
    const totalMinutes = Math.round(totalSeconds / 60);
    return `${Math.floor(totalMinutes / 60)}h ${totalMinutes % 60}m`;
}
