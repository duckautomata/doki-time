import { useId } from "react";
import Box from "@mui/material/Box";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";

/**
 * One card on the page, labelled by its heading.
 * @param {object} props
 * @param {string} props.title
 * @param {import("react").ReactNode} [props.subtitle]
 * @param {import("react").ReactNode} [props.action] - shown to the right of the heading
 */
export default function Section({ title, subtitle, action, children }) {
    const headingId = useId();

    return (
        <Paper component="section" variant="outlined" aria-labelledby={headingId} sx={{ p: { xs: 2, sm: 3 } }}>
            <Box sx={{ display: "flex", alignItems: "flex-start", gap: 1, mb: 2 }}>
                <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Typography id={headingId} variant="h6" component="h2">
                        {title}
                    </Typography>
                    {subtitle && (
                        <Typography variant="body2" sx={{ color: "text.secondary" }}>
                            {subtitle}
                        </Typography>
                    )}
                </Box>
                {action}
            </Box>
            {children}
        </Paper>
    );
}
