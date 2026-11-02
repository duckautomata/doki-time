import { useState } from "react";
import Alert from "@mui/material/Alert";
import AlertTitle from "@mui/material/AlertTitle";
import Button from "@mui/material/Button";
import CircularProgress from "@mui/material/CircularProgress";
import Snackbar from "@mui/material/Snackbar";
import SystemUpdate from "@mui/icons-material/SystemUpdate";
import { useVersionCheck } from "../logic/useVersionCheck";

/** Tells the visitor a newer build is live, and reloads onto it. */
export default function UpdateAlert() {
    const { updateAvailable } = useVersionCheck();
    const [refreshing, setRefreshing] = useState(false);

    const handleRefresh = () => {
        setRefreshing(true);
        // A plain reload keeps the shared ?d=&t= time in the address bar.
        window.location.reload();
    };

    return (
        <Snackbar
            open={updateAvailable}
            anchorOrigin={{ vertical: "top", horizontal: "center" }}
            sx={{ width: "90%", maxWidth: 520 }}
        >
            <Alert
                severity="info"
                variant="filled"
                icon={false}
                sx={{ alignItems: "center", width: "100%" }}
                action={
                    <Button
                        variant="contained"
                        color="inherit"
                        size="small"
                        disabled={refreshing}
                        startIcon={refreshing ? <CircularProgress size={18} color="inherit" /> : <SystemUpdate />}
                        onClick={handleRefresh}
                        sx={{ whiteSpace: "nowrap", fontWeight: 700 }}
                    >
                        {refreshing ? "Updating..." : "Update"}
                    </Button>
                }
            >
                {/* AlertTitle renders a div by default, which would drop the banner's heading. */}
                <AlertTitle component="h4">Update Available</AlertTitle>
                Refresh the page or click the update button to update the website.
            </Alert>
        </Snackbar>
    );
}
