import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Chip from "@mui/material/Chip";
import Tooltip from "@mui/material/Tooltip";
import Typography from "@mui/material/Typography";
import LinkIcon from "@mui/icons-material/Link";
import RestartAlt from "@mui/icons-material/RestartAlt";
import DayPicker from "./DayPicker";
import Section from "./Section";
import TimePicker from "./TimePicker";
import { DOKI_ZONE, formatDate, formatTime } from "../logic/time";

const NUDGES = [
    { label: "−1d", name: "Back 1 day", minutes: -24 * 60 },
    { label: "−1h", name: "Back 1 hour", minutes: -60 },
    { label: "−15m", name: "Back 15 minutes", minutes: -15 },
    { label: "+15m", name: "Forward 15 minutes", minutes: 15 },
    { label: "+1h", name: "Forward 1 hour", minutes: 60 },
    { label: "+1d", name: "Forward 1 day", minutes: 24 * 60 },
];

function LiveChip() {
    return (
        <Tooltip title="Following the current time. Pick a day or time to choose another.">
            <Chip size="small" color="success" variant="outlined" label="Live" sx={{ fontWeight: 700 }} />
        </Tooltip>
    );
}

/**
 * The Doki Time the rest of the page converts.
 * @param {object} props
 * @param {string} props.date - "YYYY-MM-DD"
 * @param {string} props.time - "HH:mm"
 * @param {string} props.today - "YYYY-MM-DD", today in Doki Time
 * @param {number | null} props.instant - the date and time as a timestamp, null if they aren't a real date and time
 * @param {boolean} props.live - following the current time
 * @param {boolean} props.hour12
 * @param {(selection: { date: string, time: string }) => void} props.onChange
 * @param {(minutes: number) => void} props.onNudge
 * @param {() => void} props.onReset
 * @param {() => void} props.onCopyLink
 */
export default function DokiTimeInput({
    date,
    time,
    today,
    instant,
    live,
    hour12,
    onChange,
    onNudge,
    onReset,
    onCopyLink,
}) {
    return (
        <Section title="Doki Time" subtitle="UTC-7" action={live && <LiveChip />}>
            <DayPicker date={date} today={today} onChange={(next) => onChange({ date: next, time })} />

            <Box sx={{ mt: 2.5 }}>
                <TimePicker time={time} hour12={hour12} onChange={(next) => onChange({ date, time: next })} />
            </Box>

            <Box sx={{ display: "grid", gridTemplateColumns: "repeat(6, 1fr)", gap: 1, mt: 2.5 }}>
                {NUDGES.map(({ label, name, minutes }) => (
                    <Button
                        key={label}
                        variant="outlined"
                        size="small"
                        aria-label={name}
                        onClick={() => onNudge(minutes)}
                        sx={{ minWidth: 0, px: 0.5, fontVariantNumeric: "tabular-nums" }}
                    >
                        {label}
                    </Button>
                ))}
            </Box>

            <Box sx={{ display: "flex", alignItems: "center", flexWrap: "wrap", gap: 1, mt: 2 }}>
                <Typography sx={{ flex: 1, minWidth: 220, color: instant === null ? "error.main" : "text.secondary" }}>
                    {instant === null
                        ? "That isn't a real date and time."
                        : `${formatDate(instant, DOKI_ZONE)} · ${formatTime(instant, DOKI_ZONE, { hour12, seconds: live })}`}
                </Typography>
                {/* Wraps as a pair under the summary on narrow screens */}
                <Box sx={{ display: "flex", gap: 1, ml: "auto" }}>
                    <Button startIcon={<LinkIcon />} onClick={onCopyLink} disabled={instant === null}>
                        Copy link
                    </Button>
                    <Button variant="contained" startIcon={<RestartAlt />} onClick={onReset} disabled={live}>
                        Reset
                    </Button>
                </Box>
            </Box>
        </Section>
    );
}
