// One variable font file per subset covers every weight (300-700) MUI uses
import "@fontsource-variable/roboto";
import "./index.css";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.jsx";

createRoot(document.getElementById("root")).render(
    <StrictMode>
        <App />
    </StrictMode>,
);
