import Box from "@mui/material/Box";
import Chip from "@mui/material/Chip";
import Divider from "@mui/material/Divider";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import Section from "./Section";
import {
    GMT_ZONE,
    JST_ZONE,
    dayDifference,
    formatDate,
    formatOffset,
    formatTime,
    localTimeZone,
    offsetMinutes,
} from "../logic/time";

function ZoneRow({ label, detail, timeZone, instant, live, hour12 }) {
    const offset = formatOffset(offsetMinutes(instant, timeZone));
    const days = dayDifference(instant, timeZone);

    return (
        <Box role="group" aria-label={label} sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            <Box sx={{ flex: 1, minWidth: 0 }}>
                <Typography variant="subtitle1" component="h3" sx={{ fontWeight: 700 }}>
                    {label}
                </Typography>
                <Typography variant="body2" noWrap sx={{ color: "text.secondary" }}>
                    {detail ? `${detail} · ${offset}` : offset}
                </Typography>
            </Box>
            <Box sx={{ textAlign: "right" }}>
                <Typography variant="h5" component="p" sx={{ fontVariantNumeric: "tabular-nums" }}>
                    {formatTime(instant, timeZone, { hour12, seconds: live })}
                </Typography>
                <Box sx={{ display: "flex", alignItems: "center", justifyContent: "flex-end", gap: 1 }}>
                    {days !== 0 && (
                        <Chip
                            size="small"
                            color={days > 0 ? "warning" : "info"}
                            label={days > 0 ? "Next day" : "Previous day"}
                            sx={{ fontWeight: 700 }}
                        />
                    )}
                    <Typography variant="body2" sx={{ color: "text.secondary", whiteSpace: "nowrap" }}>
                        {formatDate(instant, timeZone)}
                    </Typography>
                </Box>
            </Box>
        </Box>
    );
}

/**
 * The Doki Time in GMT, JST and the visitor's own zone, flagging any that land on another day.
 * @param {object} props
 * @param {number | null} props.instant
 * @param {boolean} props.live
 * @param {boolean} props.hour12
 */
export default function ConvertedTimes({ instant, live, hour12 }) {
    const local = localTimeZone();
    const zones = [
        { label: "GMT", timeZone: GMT_ZONE },
        { label: "JST", detail: "Japan", timeZone: JST_ZONE },
        { label: "Your time", detail: local.replaceAll("_", " "), timeZone: local },
    ];

    return (
        <Section title="Converted">
            {instant === null ? (
                <Typography sx={{ color: "text.secondary" }}>
                    Enter a full Doki Time date and time to convert it.
                </Typography>
            ) : (
                <Stack spacing={1.5} divider={<Divider flexItem />}>
                    {zones.map((zone) => (
                        <ZoneRow key={zone.label} {...zone} instant={instant} live={live} hour12={hour12} />
                    ))}
                </Stack>
            )}
        </Section>
    );
}
