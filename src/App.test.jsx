import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import App from "./App";
import { addDays } from "./logic/picker";
import { instantToDoki } from "./logic/time";

const zone = (name) => screen.getByRole("group", { name });
// The line under the pickers, e.g. "Thu, Nov 5, 2026 · 7:00 PM"
const summary = (text) => screen.getByText(text, { selector: "p" });

const choose = (dropdown, option) => {
    fireEvent.mouseDown(screen.getByRole("combobox", { name: new RegExp(`^${dropdown}`) }));
    fireEvent.click(screen.getByRole("option", { name: option }));
};

const renderAt = (search) => {
    window.history.replaceState(null, "", `/doki-time/${search}`);
    return render(<App />);
};

describe("App", () => {
    beforeEach(() => {
        // A time server that agrees with this device's clock
        vi.stubGlobal(
            "fetch",
            vi.fn(async () => ({ ok: true, json: async () => ({ now: Date.now() }) })),
        );
    });

    afterEach(() => {
        cleanup();
        vi.unstubAllGlobals();
    });

    it("converts a shared Doki Time and flags the next day", async () => {
        renderAt("?d=2026-11-05&t=19:00");

        expect(summary("Thu, Nov 5, 2026 · 7:00 PM")).toBeInTheDocument();
        expect(screen.getByRole("combobox", { name: /^Hour/ })).toHaveTextContent("7");
        expect(screen.getByRole("combobox", { name: /^Minute/ })).toHaveTextContent("00");
        expect(screen.getByRole("button", { name: "PM" })).toHaveAttribute("aria-pressed", "true");
        expect(within(zone("GMT")).getByText("2:00 AM")).toBeInTheDocument();
        expect(within(zone("GMT")).getByText("Next day")).toBeInTheDocument();
        expect(within(zone("JST")).getByText("11:00 AM")).toBeInTheDocument();
        expect(within(zone("JST")).getByText("Next day")).toBeInTheDocument();
        expect(zone("Your time")).toBeInTheDocument();
        expect(screen.getByText("<t:1793930400:F>")).toBeInTheDocument();
        expect(await screen.findByText("Your clock is in sync")).toBeInTheDocument();
    });

    it("leaves a zone unflagged on the same day", () => {
        renderAt("?d=2026-11-05&t=07:00");

        expect(within(zone("JST")).getByText("11:00 PM")).toBeInTheDocument();
        expect(within(zone("JST")).queryByText("Next day")).not.toBeInTheDocument();
    });

    it("switches to a 24-hour clock", () => {
        renderAt("?d=2026-11-05&t=19:00");

        fireEvent.click(screen.getByRole("button", { name: "24h" }));

        expect(within(zone("GMT")).getByText("02:00")).toBeInTheDocument();
        expect(within(zone("JST")).getByText("11:00")).toBeInTheDocument();
    });

    it("nudges the time and keeps the link in step", () => {
        renderAt("?d=2026-11-05&t=19:00");

        fireEvent.click(screen.getByRole("button", { name: "Forward 1 hour" }));
        expect(screen.getByRole("combobox", { name: /^Hour/ })).toHaveTextContent("8");
        expect(window.location.search).toBe("?d=2026-11-05&t=20%3A00");

        fireEvent.click(screen.getByRole("button", { name: "Back 1 day" }));
        expect(summary("Wed, Nov 4, 2026 · 8:00 PM")).toBeInTheDocument();
    });

    it("picks the time from the dropdowns", () => {
        renderAt("?d=2026-11-05&t=19:00");

        choose("Hour", "6");
        fireEvent.click(screen.getByRole("button", { name: "AM" }));
        choose("Minute", "30");

        expect(within(zone("JST")).getByText("10:30 PM")).toBeInTheDocument();
        expect(within(zone("JST")).queryByText("Next day")).not.toBeInTheDocument();
        expect(window.location.search).toBe("?d=2026-11-05&t=06%3A30");
    });

    it("types an exact time", () => {
        renderAt("?d=2026-11-05&t=19:00");

        fireEvent.click(screen.getByRole("button", { name: "Type time" }));
        const field = screen.getByRole("textbox", { name: "Time" });
        expect(field).toHaveValue("7:00 PM");

        fireEvent.change(field, { target: { value: "6:37am" } });
        expect(window.location.search).toBe("?d=2026-11-05&t=06%3A37");
        expect(within(zone("JST")).getByText("10:37 PM")).toBeInTheDocument();

        // Tidied up on leaving the field, and the dropdowns pick up the exact minute
        fireEvent.blur(field);
        expect(field).toHaveValue("6:37 AM");
        fireEvent.click(screen.getByRole("button", { name: "Pick time" }));
        expect(screen.getByRole("combobox", { name: /^Minute/ })).toHaveTextContent("37");
    });

    it("keeps the last good time while a typed time is wrong", () => {
        renderAt("?d=2026-11-05&t=19:00");

        fireEvent.click(screen.getByRole("button", { name: "Type time" }));
        const field = screen.getByRole("textbox", { name: "Time" });
        fireEvent.change(field, { target: { value: "25:00" } });
        fireEvent.blur(field);

        expect(screen.getByText("Couldn't read that. Try 7:30 PM.")).toBeInTheDocument();
        expect(window.location.search).toBe("?d=2026-11-05&t=19%3A00");
    });

    it("picks a day from the next two weeks", () => {
        renderAt("");
        const today = instantToDoki(Date.now()).date;
        const days = within(screen.getByRole("group", { name: "Next two weeks" })).getAllByRole("button");
        expect(days[0]).toHaveAttribute("aria-pressed", "true");

        fireEvent.click(days[1]);

        expect(days[1]).toHaveAttribute("aria-pressed", "true");
        expect(new URLSearchParams(window.location.search).get("d")).toBe(addDays(today, 1));
        expect(screen.queryByText("Live")).not.toBeInTheDocument();
    });

    it("picks any other date from the calendar", () => {
        renderAt("?d=2026-11-05&t=19:00");

        // Reads "Other date" while Nov 5 is in the next two weeks, and the date itself once it isn't
        fireEvent.click(screen.getByRole("button", { name: /^(Other date|Thu, Nov 5, 2026)$/ }));
        fireEvent.click(screen.getByRole("button", { name: "Next month" }));
        const december = screen.getByRole("group", { name: "December 2026" });
        fireEvent.click(within(december).getByRole("button", { name: "Thursday, December 24, 2026" }));

        expect(window.location.search).toBe("?d=2026-12-24&t=19%3A00");
        expect(summary("Thu, Dec 24, 2026 · 7:00 PM")).toBeInTheDocument();
    });

    it("resets to the live time", () => {
        renderAt("?d=2026-11-05&t=19:00");
        expect(screen.queryByText("Live")).not.toBeInTheDocument();

        fireEvent.click(screen.getByRole("button", { name: "Reset" }));

        expect(screen.getByText("Live")).toBeInTheDocument();
        expect(screen.getByRole("button", { name: "Reset" })).toBeDisabled();
        expect(window.location.search).toBe("");
    });

    it("starts live without a shared time", () => {
        renderAt("");

        expect(screen.getByText("Live")).toBeInTheDocument();
        expect(screen.getByRole("button", { name: /^Today/ })).toHaveAttribute("aria-pressed", "true");
    });

    it("tidies a messy address and copies a clean link", async () => {
        const writeText = vi.fn(async () => {});
        Object.defineProperty(navigator, "clipboard", { value: { writeText }, configurable: true });
        window.history.replaceState(null, "", "/doki-time/something-else/?ref=discord&d=2026-11-05&t=19:00#top");
        render(<App />);

        expect(summary("Thu, Nov 5, 2026 · 7:00 PM")).toBeInTheDocument();
        expect(window.location.pathname).toBe("/doki-time/");
        expect(window.location.search).toBe("?d=2026-11-05&t=19%3A00");
        expect(window.location.hash).toBe("");

        fireEvent.click(screen.getByRole("button", { name: "Copy link" }));

        expect(await screen.findByText("Copied a link to this time")).toBeInTheDocument();
        expect(writeText).toHaveBeenCalledWith(`${window.location.origin}/doki-time/?d=2026-11-05&t=19%3A00`);
        delete navigator.clipboard;
    });

    it("says when the clock can't be checked", async () => {
        vi.stubGlobal(
            "fetch",
            vi.fn(async () => ({ ok: false, status: 503 })),
        );
        renderAt("");

        expect(await screen.findByText("Couldn't check your clock")).toBeInTheDocument();
    });
});
