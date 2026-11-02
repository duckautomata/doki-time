import { useState } from "react";
import Box from "@mui/material/Box";
import ButtonBase from "@mui/material/ButtonBase";
import IconButton from "@mui/material/IconButton";
import Typography from "@mui/material/Typography";
import ChevronLeft from "@mui/icons-material/ChevronLeft";
import ChevronRight from "@mui/icons-material/ChevronRight";
import { addMonths, firstDayOfWeek, formatDay, monthCells, weekdayNames } from "../logic/picker";

const FIRST_DAY = firstDayOfWeek();
const WEEKDAYS = weekdayNames(FIRST_DAY, "narrow");

/**
 * A month of days to click. Opens on the month of `value`, and the arrows page through others.
 * @param {object} props
 * @param {string} props.value - "YYYY-MM-DD"
 * @param {string} props.today - "YYYY-MM-DD", outlined
 * @param {(date: string) => void} props.onChange
 */
export default function MonthCalendar({ value, today, onChange }) {
    const [month, setMonth] = useState(() => value.slice(0, 7));
    const title = formatDay(`${month}-01`, { month: "long", year: "numeric" });

    return (
        <Box sx={{ width: "100%", maxWidth: 320 }}>
            <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
                <IconButton size="small" aria-label="Previous month" onClick={() => setMonth(addMonths(month, -1))}>
                    <ChevronLeft />
                </IconButton>
                <Typography sx={{ flex: 1, textAlign: "center", fontWeight: 500 }}>{title}</Typography>
                <IconButton size="small" aria-label="Next month" onClick={() => setMonth(addMonths(month, 1))}>
                    <ChevronRight />
                </IconButton>
            </Box>
            <Box
                role="group"
                aria-label={title}
                sx={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 0.5, textAlign: "center" }}
            >
                {WEEKDAYS.map((name, i) => (
                    <Typography key={i} variant="caption" sx={{ color: "text.secondary" }}>
                        {name}
                    </Typography>
                ))}
                {monthCells(month, FIRST_DAY).map((day, i) =>
                    day === null ? (
                        <span key={`blank-${i}`} />
                    ) : (
                        <ButtonBase
                            key={day}
                            onClick={() => onChange(day)}
                            aria-label={formatDay(day, { dateStyle: "full" })}
                            aria-pressed={day === value}
                            sx={(theme) => ({
                                aspectRatio: "1",
                                borderRadius: "50%",
                                fontSize: "0.875rem",
                                border: `1px solid ${day === today ? theme.palette.primary.main : "transparent"}`,
                                "&.Mui-focusVisible": { outline: `2px solid ${theme.palette.primary.main}` },
                                ...(day === value
                                    ? { bgcolor: "primary.main", color: "primary.contrastText" }
                                    : { "&:hover": { bgcolor: "action.hover" } }),
                            })}
                        >
                            {Number(day.slice(8))}
                        </ButtonBase>
                    ),
                )}
            </Box>
        </Box>
    );
}
