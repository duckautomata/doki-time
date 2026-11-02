import { dokiToInstant } from "./time";

// ?d=2026-11-05&t=19:00 is a Doki Time date and time.
const DATE_PARAM = "d";
const TIME_PARAM = "t";

/**
 * Reads a shared Doki Time from the query string.
 * @param {string} search - e.g. window.location.search
 * @returns {{ date: string, time: string } | null} null when the link has no valid time
 */
export function readShareParams(search) {
    const params = new URLSearchParams(search);
    const date = params.get(DATE_PARAM);
    const time = params.get(TIME_PARAM);
    return dokiToInstant(date, time) === null ? null : { date, time };
}

/**
 * A clean link to the page, pointing at a Doki Time. It's a one-page site, so anything else in the address
 * (a made-up path under the page, other query parameters, a #hash) means nothing and is dropped.
 * @param {string} href - the current URL, for its origin
 * @param {string} base - the page's path, e.g. "/doki-time/"
 * @param {{ date: string, time: string } | null} selection - Doki Time, or null for a link to live time
 * @returns {string} e.g. "https://www.duck-automata.com/doki-time/?d=2026-11-05&t=19%3A00"
 */
export function shareUrl(href, base, selection) {
    const url = new URL(base, href);
    if (selection) {
        url.searchParams.set(DATE_PARAM, selection.date);
        url.searchParams.set(TIME_PARAM, selection.time);
    }
    return url.toString();
}
