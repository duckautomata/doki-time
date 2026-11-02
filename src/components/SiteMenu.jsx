import { useRef, useState } from "react";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import Tooltip from "@mui/material/Tooltip";
import GridViewOutlined from "@mui/icons-material/GridViewOutlined";
import NorthEast from "@mui/icons-material/NorthEast";

const BUTTON_ID = "site-menu-button";
const MENU_ID = "site-menu";

/**
 * The site title and a grid button, which both open a menu with a link to the hub.
 * @param {object} props
 * @param {string} props.title - The site's title, shown in the header.
 * @param {string} props.hubUrl - Where "All my sites" goes.
 */
export default function SiteMenu({ title, hubUrl }) {
    const gridButton = useRef(null);
    const [anchorEl, setAnchorEl] = useState(null);
    const open = Boolean(anchorEl);
    const closeMenu = () => setAnchorEl(null);

    // Both the grid button and the title open the same menu, lined up under the grid button either way.
    // aria-expanded stays present while closed so either trigger reads as a collapsed control.
    const triggerProps = {
        "aria-haspopup": "true",
        "aria-controls": open ? MENU_ID : undefined,
        "aria-expanded": open,
        onClick: () => setAnchorEl(gridButton.current),
    };

    return (
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.25, minWidth: 0 }}>
            <Tooltip title="My sites">
                <IconButton
                    {...triggerProps}
                    ref={gridButton}
                    id={BUTTON_ID}
                    aria-label="Site menu"
                    size="small"
                    sx={{
                        width: 34,
                        height: 34,
                        flexShrink: 0,
                        border: 1,
                        borderColor: open ? "primary.main" : "divider",
                        borderRadius: 1,
                        color: open ? "primary.main" : "text.secondary",
                        bgcolor: open ? "primary.soft" : "transparent",
                    }}
                >
                    <GridViewOutlined sx={{ fontSize: 18 }} />
                </IconButton>
            </Tooltip>
            <Button
                {...triggerProps}
                disableRipple
                sx={{
                    // The site's name, not a button that looks like one. Shown on phones too, since
                    // there are no page links competing for the row.
                    p: 0,
                    minWidth: 0,
                    fontSize: "1.5rem",
                    fontWeight: 800,
                    lineHeight: 1.2,
                    color: "primary.light",
                    whiteSpace: "nowrap",
                    "&:hover": { bgcolor: "transparent", color: "primary.hover" },
                }}
            >
                {title}
            </Button>
            <Menu
                id={MENU_ID}
                anchorEl={anchorEl}
                open={open}
                onClose={closeMenu}
                anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
                transformOrigin={{ vertical: "top", horizontal: "left" }}
                slotProps={{
                    list: { "aria-labelledby": BUTTON_ID, dense: true },
                    paper: { sx: { minWidth: 240, maxWidth: "calc(100vw - 2rem)", mt: 0.5 } },
                }}
            >
                <MenuItem component="a" href={hubUrl} onClick={closeMenu}>
                    <ListItemIcon>
                        <GridViewOutlined fontSize="small" />
                    </ListItemIcon>
                    <ListItemText primary="All my sites" />
                    <NorthEast fontSize="small" sx={{ ml: 2, color: "text.secondary" }} />
                </MenuItem>
            </Menu>
        </Box>
    );
}
