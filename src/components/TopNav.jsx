import AppBar from "@mui/material/AppBar";
import Box from "@mui/material/Box";
import Toolbar from "@mui/material/Toolbar";
import EnvironmentBadge from "./EnvironmentBadge";
import SiteMenu from "./SiteMenu";

/**
 * The sticky top header.
 * @param {object} props
 * @param {string} props.title - The site's title, shown beside the site menu button.
 * @param {string} props.hubUrl - Where the site menu's "All my sites" goes.
 * @param {React.ReactNode} [props.actions] - Controls on the right, e.g. the clock format toggle.
 */
export default function TopNav({ title, hubUrl, actions }) {
    return (
        <AppBar
            position="sticky"
            elevation={0}
            sx={{
                bgcolor: "background.default",
                color: "text.primary",
                borderBottom: 1,
                borderColor: "divider",
            }}
        >
            <Toolbar
                disableGutters
                sx={{
                    display: "flex",
                    flexWrap: "wrap",
                    justifyContent: "space-between",
                    alignItems: "center",
                    gap: { xs: 1, sm: 2 },
                    px: { xs: 2, sm: 4 },
                    py: { xs: 1.5, sm: 2 },
                    minHeight: 0,
                }}
            >
                <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, minWidth: 0 }}>
                    <SiteMenu title={title} hubUrl={hubUrl} />
                    <EnvironmentBadge />
                </Box>
                {actions}
            </Toolbar>
        </AppBar>
    );
}
