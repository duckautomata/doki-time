/**
 * Copy text to the clipboard. Uses the async Clipboard API when available (secure contexts) and falls
 * back to a hidden textarea + execCommand for older browsers / plain http.
 * @param {string} text
 * @returns {Promise<boolean>} true when the text was copied
 */
export async function copyToClipboard(text) {
    try {
        if (navigator.clipboard?.writeText) {
            await navigator.clipboard.writeText(text);
            return true;
        }
    } catch {
        // fall through to the legacy approach
    }

    try {
        const textarea = document.createElement("textarea");
        textarea.value = text;
        textarea.setAttribute("readonly", "");
        textarea.style.position = "fixed";
        textarea.style.top = "0";
        textarea.style.left = "0";
        textarea.style.opacity = "0";
        document.body.appendChild(textarea);
        textarea.select();
        const copied = document.execCommand("copy");
        textarea.remove();
        return copied;
    } catch {
        return false;
    }
}
