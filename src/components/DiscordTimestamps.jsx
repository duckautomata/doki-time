import Box from "@mui/material/Box";
import List from "@mui/material/List";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemText from "@mui/material/ListItemText";
import Typography from "@mui/material/Typography";
import ContentCopy from "@mui/icons-material/ContentCopy";
import Section from "./Section";
import { DISCORD_STYLES, discordPreview, discordTag } from "../logic/time";

/**
 * Discord's timestamp tags for the Doki Time, each previewed and copied with one click.
 * @param {object} props
 * @param {number | null} props.instant
 * @param {number} props.now - for the relative preview
 * @param {boolean} props.hour12
 * @param {(text: string, message: string) => void} props.onCopy
 */
export default function DiscordTimestamps({ instant, now, hour12, onCopy }) {
    return (
        <Section title="Discord timestamps" subtitle="Discord shows each reader the time in their own time zone.">
            {instant === null ? (
                <Typography sx={{ color: "text.secondary" }}>Enter a full Doki Time date and time first.</Typography>
            ) : (
                <List disablePadding sx={{ mx: -1 }}>
                    {DISCORD_STYLES.map(({ style, name }) => {
                        const tag = discordTag(instant, style);
                        return (
                            <ListItemButton
                                key={style}
                                onClick={() => onCopy(tag, `Copied ${tag}`)}
                                sx={{ borderRadius: 1, px: 1 }}
                            >
                                <ListItemText
                                    primary={discordPreview(instant, style, { now, hour12 })}
                                    secondary={
                                        <>
                                            <Box component="code" sx={{ fontFamily: "monospace" }}>
                                                {tag}
                                            </Box>
                                            {` · ${name}`}
                                        </>
                                    }
                                />
                                <ContentCopy fontSize="small" sx={{ color: "text.secondary", ml: 1 }} />
                            </ListItemButton>
                        );
                    })}
                </List>
            )}
        </Section>
    );
}
