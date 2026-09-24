import { useEffect, useState } from 'react';

function splitDuration(ms) {
  if (ms <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0, isOver: true };
  const totalSeconds = Math.floor(ms / 1000);
  return {
    days: Math.floor(totalSeconds / 86400),
    hours: Math.floor((totalSeconds % 86400) / 3600),
    minutes: Math.floor((totalSeconds % 3600) / 60),
    seconds: totalSeconds % 60,
    isOver: false,
  };
}

/** Ticks every second toward `targetDate`, entirely client-side once the
 * server has told us which date matters right now. */
export function useCountdown(targetDate) {
  const [duration, setDuration] = useState(() =>
    targetDate ? splitDuration(new Date(targetDate).getTime() - Date.now()) : { isOver: true }
  );

  useEffect(() => {
    if (!targetDate) return undefined;
    const tick = () => setDuration(splitDuration(new Date(targetDate).getTime() - Date.now()));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [targetDate]);

  return duration;
}
