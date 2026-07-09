import { useEffect, useRef, useState } from 'react';

export function useFloatingPosition(x: number, y: number, selectionTop: number) {
  const menuRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState({ x, y });

  useEffect(() => {
    if (!menuRef.current) return;
    const menuRect = menuRef.current.getBoundingClientRect();
    const viewportH = window.innerHeight;
    const viewportW = window.innerWidth;
    const gap = 8;

    let top = y + gap;
    const belowEnd = top + menuRect.height + gap;
    if (belowEnd > viewportH) {
      top = selectionTop - menuRect.height - gap;
    }
    if (top < gap) top = gap;

    const halfW = menuRect.width / 2;
    let left = x - halfW;
    if (left < gap) left = gap;
    if (left + menuRect.width > viewportW - gap) left = viewportW - gap - menuRect.width;

    setPosition({ x: left, y: top });
  }, [x, y, selectionTop]);

  return { menuRef, position };
}
