import { useEffect, useState } from "react";

/**
 * The current time, ticking once a second on the second.
 * @param {number} [offset] - ms to add to the device clock, from the clock check
 * @returns {number} epoch ms
 */
export function useNow(offset = 0) {
    const [now, setNow] = useState(() => Date.now() + offset);

    useEffect(() => {
        let timer;
        const tick = () => {
            const current = Date.now() + offset;
            setNow(current);
            // A few ms past the next second, so an early timer doesn't show the same second twice.
            timer = setTimeout(tick, 1000 - (current % 1000) + 5);
        };
        tick();
        return () => clearTimeout(timer);
    }, [offset]);

    return now;
}
