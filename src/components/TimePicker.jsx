import { useEffect, useRef, useState } from "react";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import MenuItem from "@mui/material/MenuItem";
import TextField from "@mui/material/TextField";
import ToggleButton from "@mui/material/ToggleButton";
import ToggleButtonGroup from "@mui/material/ToggleButtonGroup";
import Typography from "@mui/material/Typography";
import Keyboard from "@mui/icons-material/Keyboard";
import Schedule from "@mui/icons-material/Schedule";
import {
    formatTypedTime,
    hourItems,
    hourValue,
    minuteItems,
    minuteValue,
    parseTypedTime,
    periodItems,
    periodValue,
    withHour,
    withMinute,
    withPeriod,
} from "../logic/picker";

function TimeSelect({ label, items, value, onChange }) {
    return (
        <TextField
            select
            label={label}
            value={value}
            onChange={(event) => onChange(event.target.value)}
            sx={{ minWidth: 80 }}
            slotProps={{ select: { MenuProps: { slotProps: { paper: { sx: { maxHeight: 320 } } } } } }}
        >
            {items.map((item) => (
                <MenuItem key={item.value} value={item.value}>
                    {item.label}
                </MenuItem>
            ))}
        </TextField>
    );
}

function TimeDropdowns({ time, hour12, onChange }) {
    return (
        <Box sx={{ display: "flex", alignItems: "center", flexWrap: "wrap", gap: 1.5 }}>
            <TimeSelect
                label="Hour"
                items={hourItems(hour12)}
                value={hourValue(time, hour12)}
                onChange={(value) => onChange(withHour(time, value, hour12))}
            />
            <TimeSelect
                label="Minute"
                items={minuteItems(time)}
                value={minuteValue(time)}
                onChange={(value) => onChange(withMinute(time, value))}
            />
            {hour12 && (
                <ToggleButtonGroup
                    exclusive
                    value={periodValue(time)}
                    onChange={(_event, value) => value && onChange(withPeriod(time, value))}
                    aria-label="AM or PM"
                    sx={{ height: 56 }}
                >
                    {periodItems().map((item) => (
                        <ToggleButton key={item.value} value={item.value} sx={{ px: 2 }}>
                            {item.label}
                        </ToggleButton>
                    ))}
                </ToggleButtonGroup>
            )}
        </Box>
    );
}

function TypedTime({ time, hour12, onChange }) {
    const inputRef = useRef(null);
    const [text, setText] = useState(() => formatTypedTime(time, hour12));
    const [focused, setFocused] = useState(true);
    const keepPeriod = hour12 ? periodValue(time) : null;
    const parsed = parseTypedTime(text, keepPeriod);

    // Show the new time when it changes from outside, like a nudge, or when the clock format changes.
    // A change that came from this field already matches what's typed, and the live clock ticking over
    // mustn't wipe a half-typed time, so those leave the text alone.
    const [shown, setShown] = useState({ time, hour12 });
    if (shown.time !== time || shown.hour12 !== hour12) {
        setShown({ time, hour12 });
        const halfTyped = focused && parsed === null;
        if (shown.hour12 !== hour12 || (parsed !== time && !halfTyped)) setText(formatTypedTime(time, hour12));
    }

    // Ready to type over as soon as the field appears
    useEffect(() => {
        inputRef.current?.focus();
        inputRef.current?.select();
    }, []);

    const tidy = () => {
        if (parsed !== null) setText(formatTypedTime(parsed, hour12));
    };

    return (
        <TextField
            label="Time"
            value={text}
            inputRef={inputRef}
            placeholder={hour12 ? "7:30 PM" : "19:30"}
            onChange={(event) => {
                setText(event.target.value);
                const next = parseTypedTime(event.target.value, keepPeriod);
                if (next !== null) onChange(next);
            }}
            onFocus={() => setFocused(true)}
            onBlur={() => {
                setFocused(false);
                tidy();
            }}
            onKeyDown={(event) => event.key === "Enter" && tidy()}
            // Mid-typing ("7:") isn't a time yet, so only complain once the visitor moves on
            error={!focused && parsed === null}
            helperText={!focused && parsed === null ? `Couldn't read that. Try ${hour12 ? "7:30 PM" : "19:30"}.` : ""}
            sx={{ width: 200 }}
            slotProps={{ htmlInput: { autoComplete: "off", spellCheck: false } }}
        />
    );
}

/**
 * Hour and minute dropdowns, or a box to type the exact time into.
 * @param {object} props
 * @param {string} props.time - "HH:mm"
 * @param {boolean} props.hour12
 * @param {(time: string) => void} props.onChange
 */
export default function TimePicker({ time, hour12, onChange }) {
    const [typing, setTyping] = useState(false);

    return (
        <>
            <Box sx={{ display: "flex", alignItems: "center", mb: 1.5 }}>
                <Typography sx={{ flex: 1, fontWeight: 500 }}>Time</Typography>
                <Button
                    size="small"
                    startIcon={typing ? <Schedule /> : <Keyboard />}
                    onClick={() => setTyping(!typing)}
                >
                    {typing ? "Pick time" : "Type time"}
                </Button>
            </Box>
            {typing ? (
                <TypedTime time={time} hour12={hour12} onChange={onChange} />
            ) : (
                <TimeDropdowns time={time} hour12={hour12} onChange={onChange} />
            )}
        </>
    );
}
