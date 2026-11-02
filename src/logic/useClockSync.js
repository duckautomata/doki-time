import { useCallback, useEffect, useRef, useState } from "react";
import { measureClockOffset } from "./clockSync";

/**
 * Measures this device's clock against the server's once on load, and again whenever `check` is called.
 * @returns {{ status: "checking" | "done" | "error", offset: number, uncertainty: number | null, check: () => void }}
 * `offset` stays at the last good measurement (0 before the first) so live times don't jump while re-checking.
 */
export function useClockSync() {
    const [state, setState] = useState({ status: "checking", offset: 0, uncertainty: null });
    // Only the latest check may report back, so a slow earlier one can't overwrite it.
    const latestCheck = useRef(0);

    const check = useCallback(async () => {
        const id = ++latestCheck.current;
        setState((previous) => ({ ...previous, status: "checking" }));
        try {
            const { offset, uncertainty } = await measureClockOffset({ url: `${import.meta.env.BASE_URL}api/time` });
            if (id === latestCheck.current) setState({ status: "done", offset, uncertainty });
        } catch {
            if (id === latestCheck.current) setState((previous) => ({ ...previous, status: "error" }));
        }
    }, []);

    useEffect(() => {
        check();
    }, [check]);

    return { ...state, check };
}
