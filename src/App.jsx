import { useEffect, useState } from "react";
import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import CssBaseline from "@mui/material/CssBaseline";
import Snackbar from "@mui/material/Snackbar";
import Stack from "@mui/material/Stack";
import ToggleButton from "@mui/material/ToggleButton";
import ToggleButtonGroup from "@mui/material/ToggleButtonGroup";
import Typography from "@mui/material/Typography";
import useMediaQuery from "@mui/material/useMediaQuery";
import { ThemeProvider } from "@mui/material/styles";
import { darkTheme, lightTheme } from "./theme";
import ClockCheck from "./components/ClockCheck";
import ConvertedTimes from "./components/ConvertedTimes";
import DiscordTimestamps from "./components/DiscordTimestamps";
import DokiTimeInput from "./components/DokiTimeInput";
import EnvironmentBadge from "./components/EnvironmentBadge";
import UpdateAlert from "./components/UpdateAlert";
import { copyToClipboard } from "./logic/clipboard";
import { readShareParams, shareUrl } from "./logic/shareLink";
import { MINUTE, dokiToInstant, instantToDoki, prefersHour12 } from "./logic/time";
import { useClockSync } from "./logic/useClockSync";
import { useNow } from "./logic/useNow";

/** A clean link to this page, at a Doki Time or (null) live. */
const linkTo = (selection) => shareUrl(window.location.href, import.meta.env.BASE_URL, selection);

export default function App() {
    const prefersDarkMode = useMediaQuery("(prefers-color-scheme: dark)");
    const clock = useClockSync();
    // Corrected by the clock check, so a visitor whose clock is off still sees the real time.
    const now = useNow(clock.offset);
    const [hour12, setHour12] = useState(() => prefersHour12());
    // null while following the live clock, otherwise the Doki Time date and time the visitor picked.
    const [selection, setSelection] = useState(() => readShareParams(window.location.search));
    const [toast, setToast] = useState({ open: false });

    const live = selection === null;
    const current = instantToDoki(now);
    const { date, time } = live ? current : selection;
    const instant = live ? now : dokiToInstant(date, time);

    // Keep the address bar a clean link to the picked time, which also tidies away any extra path or
    // parameters the visitor arrived with. Live time has nothing to share.
    useEffect(() => {
        const url = linkTo(selection);
        if (url !== window.location.href) {
            window.history.replaceState(window.history.state, "", url);
        }
    }, [selection]);

    const nudge = (minutes) => {
        // Live time is mid-minute. Nudging from the start of the minute lands on a round time.
        const start = Math.floor((instant ?? now) / MINUTE) * MINUTE;
        setSelection(instantToDoki(start + minutes * MINUTE));
    };

    const copy = async (text, message) => {
        const copied = await copyToClipboard(text);
        setToast({
            open: true,
            key: Date.now(),
            severity: copied ? "success" : "error",
            message: copied ? message : "Could not copy to clipboard",
        });
    };

    const closeToast = (_event, reason) => {
        if (reason === "clickaway") return;
        setToast((previous) => ({ ...previous, open: false }));
    };

    return (
        <ThemeProvider theme={prefersDarkMode ? darkTheme : lightTheme}>
            {/* enableColorScheme makes native controls (the date and time pickers) follow the theme */}
            <CssBaseline enableColorScheme />
            <UpdateAlert />
            <Box
                component="main"
                sx={{ maxWidth: 680, mx: "auto", px: 2, py: { xs: 3, sm: 5 }, boxSizing: "border-box" }}
            >
                <Box component="header" sx={{ display: "flex", alignItems: "center", flexWrap: "wrap", gap: 2, mb: 3 }}>
                    <Box sx={{ flex: 1, minWidth: 220 }}>
                        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                            <Typography variant="h4" component="h1">
                                Doki Time
                            </Typography>
                            <EnvironmentBadge />
                        </Box>
                        <Typography sx={{ color: "text.secondary" }}>
                            Convert Doki Time to GMT, JST and your local time.
                        </Typography>
                    </Box>
                    <ToggleButtonGroup
                        size="small"
                        exclusive
                        value={hour12 ? "12h" : "24h"}
                        onChange={(_event, value) => value && setHour12(value === "12h")}
                        aria-label="Clock format"
                    >
                        <ToggleButton value="12h">12h</ToggleButton>
                        <ToggleButton value="24h">24h</ToggleButton>
                    </ToggleButtonGroup>
                </Box>

                <Stack spacing={2}>
                    <DokiTimeInput
                        date={date}
                        time={time}
                        today={current.date}
                        instant={instant}
                        live={live}
                        hour12={hour12}
                        onChange={setSelection}
                        onNudge={nudge}
                        onReset={() => setSelection(null)}
                        onCopyLink={() => copy(linkTo(instantToDoki(instant)), "Copied a link to this time")}
                    />
                    <ConvertedTimes instant={instant} live={live} hour12={hour12} />
                    <DiscordTimestamps instant={instant} now={now} hour12={hour12} onCopy={copy} />
                    <ClockCheck
                        status={clock.status}
                        offset={clock.offset}
                        uncertainty={clock.uncertainty}
                        onCheck={clock.check}
                    />
                </Stack>
            </Box>

            <Snackbar
                key={toast.key}
                open={toast.open}
                autoHideDuration={2500}
                onClose={closeToast}
                anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
            >
                <Alert
                    onClose={closeToast}
                    severity={toast.severity}
                    variant="filled"
                    sx={{ width: "100%", borderRadius: "10px", boxShadow: 6 }}
                >
                    {toast.message}
                </Alert>
            </Snackbar>
        </ThemeProvider>
    );
}
