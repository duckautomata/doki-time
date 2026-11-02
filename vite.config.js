// oxlint-disable no-console
import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import fs from "fs";
import path from "path";

const base = "/doki-time/";
const title = "Doki Time";
const description = "Convert Doki Time to GMT, JST and your local time.";
const themeColor = "#3b82f6";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
    const buildTime = new Date().getTime();
    const env = loadEnv(mode, process.cwd());

    return {
        plugins: [
            react(),
            {
                name: "generate-version-json",
                writeBundle(options) {
                    const versionFilePath = path.resolve(options.dir || "dist/doki-time", "version.json");
                    fs.writeFileSync(versionFilePath, JSON.stringify({ buildTime }));
                    console.log(`\nGenerated version.json with buildTime: ${buildTime}`);
                },
            },
            {
                // The Worker answers this in production (src/worker.js). This stands in for it under `npm run dev`.
                name: "dev-time-api",
                configureServer(server) {
                    server.middlewares.use(`${base}api/time`, (_req, res) => {
                        res.setHeader("Content-Type", "application/json");
                        res.setHeader("Cache-Control", "no-store");
                        res.end(JSON.stringify({ now: Date.now() }));
                    });
                },
            },
        ],
        base,
        define: {
            __BUILD_TIME__: buildTime,
            // Also fills the matching %TOKENS% in index.html.
            "import.meta.env.VITE_PAGE_TITLE": JSON.stringify(`${title}${env.VITE_TITLE_SUFFIX ?? ""}`),
            "import.meta.env.VITE_SITE_DESCRIPTION": JSON.stringify(description),
            "import.meta.env.VITE_SITE_THEME_COLOR": JSON.stringify(themeColor),
        },
        server: {
            port: 5173,
            open: false,
        },
        build: {
            emptyOutDir: true,
            manifest: false,
            target: "esnext",
            outDir: "dist/doki-time", // should be the same as base
            rolldownOptions: {
                output: {
                    codeSplitting: {
                        // Libraries change only when a dependency is bumped, so they stay long-lived chunks
                        // the browser keeps across deploys.
                        groups: [
                            { name: "react", test: /node_modules[\\/](react|react-dom|scheduler)[\\/]/ },
                            { name: "mui", test: /node_modules[\\/]@(mui|emotion)[\\/]/ },
                            { name: "vendor", test: /node_modules/ },
                        ],
                    },
                },
            },
        },
        test: {
            // Vitest serves from "/" and ignores `base`, so hand the page its real path
            env: { BASE_URL: base },
            globals: true,
            environment: "jsdom",
            setupFiles: ["./src/setupTests.js"],
        },
    };
});
