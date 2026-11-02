import { createTheme } from "@mui/material/styles";

// @fontsource-variable/roboto registers the font as "Roboto Variable"
const typography = {
    fontFamily: '"Roboto Variable", "Roboto", "Helvetica", "Arial", sans-serif',
    h1: { fontWeight: 700 },
    h2: { fontWeight: 700 },
    h3: { fontWeight: 700 },
    h4: { fontWeight: 700 },
    h5: { fontWeight: 700 },
    h6: { fontWeight: 700 },
};

const accents = {
    dark: {
        main: "#3b82f6",
        light: "#60a5fa",
        dark: "#1d4ed8",
        hover: "#60a5fa",
        contrastText: "#fff",
        soft: "rgba(59, 130, 246, 0.15)",
    },
    light: {
        main: "#2563eb",
        light: "#60a5fa",
        dark: "#1e40af",
        hover: "#1d4ed8",
        contrastText: "#fff",
        soft: "rgba(37, 99, 235, 0.12)",
    },
};

const surfaces = {
    dark: {
        background: {
            default: "#0d0f1a",
            paper: "#161a27",
            inset: "#11141f",
        },
        text: {
            primary: "#f0f0f5",
            secondary: "#9ba0b5",
        },
        divider: "rgba(255, 255, 255, 0.08)",
        error: { main: "#f87171" },
        success: { main: "#4ade80" },
        warning: { main: "#fbbf24" },
    },
    light: {
        background: {
            default: "#f8fafc",
            paper: "#ffffff",
            inset: "#f1f5f9",
        },
        text: {
            primary: "#0f172a",
            secondary: "#475569",
        },
        divider: "rgba(0, 0, 0, 0.1)",
        error: { main: "#b91c1c" },
        success: { main: "#15803d" },
        warning: { main: "#b45309" },
    },
};

/**
 * @param {"light" | "dark"} mode
 */
const makeTheme = (mode) => {
    const accent = accents[mode];

    return createTheme({
        typography,
        shape: {
            borderRadius: 8,
        },
        palette: {
            mode,
            primary: accent,
            // The update banner is a filled "info" Alert. Without this it would paint itself MUI's stock blue.
            info: { main: accent.main, contrastText: accent.contrastText },
            ...surfaces[mode],
        },
        components: {
            MuiButton: {
                defaultProps: { disableElevation: true },
                styleOverrides: { root: { textTransform: "none" } },
            },
            MuiToggleButton: {
                styleOverrides: { root: { textTransform: "none" } },
            },
            MuiTooltip: {
                defaultProps: { enterDelay: 400 },
            },
        },
    });
};

export const darkTheme = makeTheme("dark");
export const lightTheme = makeTheme("light");
