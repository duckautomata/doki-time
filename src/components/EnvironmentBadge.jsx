import Chip from "@mui/material/Chip";
import Fade from "@mui/material/Fade";
import Construction from "@mui/icons-material/Construction";
import LaptopMac from "@mui/icons-material/LaptopMac";
import Science from "@mui/icons-material/Science";

const config = {
    local: {
        label: "Local",
        color: "#9c27b0", // Violet/Purple
        icon: <LaptopMac sx={{ fontSize: 16 }} />,
    },
    dev: {
        label: "Development",
        color: "#ed6c02", // Orange
        icon: <Construction sx={{ fontSize: 16 }} />,
    },
    staging: {
        label: "Staging",
        color: "#0288d1", // Cyan/Blue
        icon: <Science sx={{ fontSize: 16 }} />,
    },
};

/**
 * Names the environment the site is running in. Nothing is shown in production.
 * @param {object} props
 * @param {object} [props.sx] - Extra styles, e.g. to show the badge at one breakpoint only.
 */
export default function EnvironmentBadge({ sx }) {
    const environment = import.meta.env.VITE_ENVIRONMENT;

    if (!environment || environment === "prod" || environment === "production") {
        return null;
    }

    const envConfig = config[environment] || {
        label: environment.toUpperCase(),
        color: "#757575",
        icon: <Construction sx={{ fontSize: 16 }} />,
    };

    return (
        <Fade in appear timeout={1000}>
            <Chip
                size="small"
                icon={envConfig.icon}
                label={envConfig.label}
                sx={{
                    // The environment colour at low opacity, so the chip reads as a tint of it.
                    bgcolor: `${envConfig.color}26`,
                    color: envConfig.color,
                    border: `1px solid ${envConfig.color}40`,
                    fontWeight: 700,
                    "& .MuiChip-icon": { color: "inherit" },
                    ...sx,
                }}
            />
        </Fade>
    );
}
