import { useState } from "react";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import ButtonBase from "@mui/material/ButtonBase";
import Popover from "@mui/material/Popover";
import Typography from "@mui/material/Typography";
import CalendarMonth from "@mui/icons-material/CalendarMonth";
import MonthCalendar from "./MonthCalendar";
import { addDays, formatDay } from "../logic/picker";

const STRIP_DAYS = 14;

/**
 * The next two weeks as buttons, and a calendar for any other day.
 * @param {object} props
 * @param {string} props.date - "YYYY-MM-DD"
 * @param {string} props.today - "YYYY-MM-DD" in Doki Time, where the buttons start
 * @param {(date: string) => void} props.onChange
 */
export default function DayPicker({ date, today, onChange }) {
    const [calendarAnchor, setCalendarAnchor] = useState(null);
    const days = Array.from({ length: STRIP_DAYS }, (_, i) => addDays(today, i));
    const outsideStrip = !days.includes(date);

    return (
        <>
            <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
                <Typography sx={{ flex: 1, fontWeight: 500 }}>Day</Typography>
                <Button
                    size="small"
                    variant={outsideStrip ? "contained" : "text"}
                    startIcon={<CalendarMonth />}
                    onClick={(event) => setCalendarAnchor(event.currentTarget)}
                >
                    {outsideStrip
                        ? formatDay(date, { weekday: "short", month: "short", day: "numeric", year: "numeric" })
                        : "Other date"}
                </Button>
            </Box>

            <Box
                role="group"
                aria-label="Next two weeks"
                sx={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 0.75 }}
            >
                {days.map((day, i) => {
                    const selected = day === date;
                    // The month only on the first button and on the 1st, so a "1" after "30" isn't a puzzle
                    const showMonth = i === 0 || day.endsWith("-01");
                    return (
                        <ButtonBase
                            key={day}
                            onClick={() => onChange(day)}
                            aria-label={`${i === 0 ? "Today, " : ""}${formatDay(day, { dateStyle: "full" })}`}
                            aria-pressed={selected}
                            sx={(theme) => ({
                                flexDirection: "column",
                                py: 0.75,
                                borderRadius: 1,
                                border: `1px solid ${selected ? theme.palette.primary.main : theme.palette.divider}`,
                                "&.Mui-focusVisible": { outline: `2px solid ${theme.palette.primary.main}` },
                                ...(selected
                                    ? { bgcolor: "primary.main", color: "primary.contrastText" }
                                    : { "&:hover": { bgcolor: "action.hover" } }),
                            })}
                        >
                            <Typography variant="caption" sx={{ lineHeight: 1.2, opacity: 0.8 }}>
                                {i === 0 ? "Today" : formatDay(day, { weekday: "short" })}
                            </Typography>
                            <Typography sx={{ fontWeight: 500, fontSize: "1.1rem", lineHeight: 1.3 }}>
                                {Number(day.slice(8))}
                            </Typography>
                            <Typography variant="caption" sx={{ lineHeight: 1.2, opacity: 0.8, minHeight: "1.2em" }}>
                                {showMonth ? formatDay(day, { month: "short" }) : ""}
                            </Typography>
                        </ButtonBase>
                    );
                })}
            </Box>

            <Popover
                open={calendarAnchor !== null}
                anchorEl={calendarAnchor}
                onClose={() => setCalendarAnchor(null)}
                anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
                transformOrigin={{ vertical: "top", horizontal: "right" }}
            >
                <Box sx={{ p: 2, width: 300 }}>
                    <MonthCalendar
                        value={date}
                        today={today}
                        onChange={(next) => {
                            onChange(next);
                            setCalendarAnchor(null);
                        }}
                    />
                </Box>
            </Popover>
        </>
    );
}
