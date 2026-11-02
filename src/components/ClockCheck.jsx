import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import CircularProgress from "@mui/material/CircularProgress";
import Typography from "@mui/material/Typography";
import CheckCircle from "@mui/icons-material/CheckCircle";
import ErrorOutline from "@mui/icons-material/ErrorOutlineOutlined";
import Refresh from "@mui/icons-material/Refresh";
import WarningAmber from "@mui/icons-material/WarningAmber";
import Section from "./Section";
import { clockStatus, formatDuration } from "../logic/clockSync";

const RESULTS = {
    synced: { icon: CheckCircle, color: "success.main", title: "Your clock is in sync" },
    close: { icon: WarningAmber, color: "warning.main", title: "Your clock is a little off" },
    off: { icon: ErrorOutline, color: "error.main", title: "Your clock is off" },
};

function describe({ status, offset, uncertainty }) {
    if (status === "checking") {
        return { title: "Checking your clock…", detail: "Comparing it with the server's." };
    }
    if (status === "error") {
        return {
            icon: ErrorOutline,
            color: "error.main",
            title: "Couldn't check your clock",
            detail: "The time server didn't answer, so live times use your device's clock.",
        };
    }
    const result = clockStatus(offset);
    const direction = offset > 0 ? "behind" : "ahead";
    const corrected = result === "synced" ? "" : " Live times on this page are corrected for it.";
    return {
        ...RESULTS[result],
        detail: `It's ${formatDuration(offset)} ${direction} (±${formatDuration(uncertainty)}).${corrected}`,
    };
}

/**
 * Whether the visitor's computer clock matches the server's.
 * @param {object} props
 * @param {"checking" | "done" | "error"} props.status
 * @param {number} props.offset - server minus device, in ms
 * @param {number | null} props.uncertainty - ms
 * @param {() => void} props.onCheck
 */
export default function ClockCheck({ status, offset, uncertainty, onCheck }) {
    const { icon: Icon, color, title, detail } = describe({ status, offset, uncertainty });

    return (
        <Section title="Clock check">
            <Box sx={{ display: "flex", alignItems: "center", flexWrap: "wrap", gap: 2 }}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, flex: 1, minWidth: 220 }}>
                    <Box sx={{ display: "flex", width: 32, justifyContent: "center", color }}>
                        {Icon ? <Icon sx={{ fontSize: 32 }} /> : <CircularProgress size={26} />}
                    </Box>
                    <Box aria-live="polite">
                        <Typography sx={{ fontWeight: 700 }}>{title}</Typography>
                        <Typography variant="body2" sx={{ color: "text.secondary" }}>
                            {detail}
                        </Typography>
                    </Box>
                </Box>
                <Button
                    variant="outlined"
                    startIcon={<Refresh />}
                    onClick={onCheck}
                    disabled={status === "checking"}
                    sx={{ ml: "auto" }}
                >
                    Check again
                </Button>
            </Box>
        </Section>
    );
}
