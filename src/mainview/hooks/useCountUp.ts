import { useEffect, useRef, useState } from 'react';

const STEP_MS = 16;

export function useCountUp(target: number, duration = 800): number {
  const [value, setValue] = useState(0);
  const valueRef = useRef(0);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (target === 0) {
      setValue(0);
      valueRef.current = 0;
      return;
    }

    const start = performance.now();
    let completed = false;

    const tick = () => {
      const elapsed = performance.now() - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const next = Math.round(eased * target);
      if (next !== valueRef.current) {
        valueRef.current = next;
        setValue(next);
      }
      if (progress < 1) {
        timerRef.current = setTimeout(tick, STEP_MS);
      } else {
        if (!completed) {
          completed = true;
          setValue(target);
          valueRef.current = target;
        }
      }
    };

    timerRef.current = setTimeout(tick, STEP_MS);
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [target, duration]);

  return value;
}
