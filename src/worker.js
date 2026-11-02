const base = "/doki-time/";

export default {
    async fetch(request, env) {
        const url = new URL(request.url);

        // Production routes only send /doki-time paths to this Worker, so this only
        // matters for local preview (`npm run preview`), which opens on "/".
        if (url.pathname === "/") {
            url.pathname = base;
            return Response.redirect(url.toString(), 302);
        }

        // 0. Redirect /doki-time (no trailing slash) to /doki-time/
        if (url.pathname === "/doki-time") {
            url.pathname = base;
            return Response.redirect(url.toString(), 301);
        }

        // The clock check compares the visitor's clock against this. Workers freeze Date.now() between
        // I/O, so it reads the moment the request arrived, which is what the round-trip math assumes.
        if (url.pathname === `${base}api/time`) {
            return Response.json({ now: Date.now() }, { headers: { "Cache-Control": "no-store" } });
        }

        // 1. Attempt to fetch the requested asset
        const response = await env.ASSETS.fetch(request);

        // 2. Handle 404s
        if (response.status === 404) {
            // Check if the URL path ends with a file extension (e.g., .css, .js, .png)
            const hasFileExtension = url.pathname.match(/\.[a-z0-9]+$/i);

            if (hasFileExtension) {
                // It's a missing static asset. Return the actual 404 response.
                return response;
            }

            // It's a navigation route (no extension). Fallback to the SPA's root.
            url.pathname = base;
            return env.ASSETS.fetch(new Request(url, request));
        }

        // 3. Return the successfully found asset
        return response;
    },
};
