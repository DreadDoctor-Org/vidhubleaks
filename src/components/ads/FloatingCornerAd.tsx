import { useEffect, useRef } from 'react';

export function FloatingCornerAd() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    container.innerHTML = '';

    const script = document.createElement('script');
    script.src = 'https://elegantimpose.com/73/38/e6/7338e69a06a3ba20c8eb64be8062563a.js';
    container.appendChild(script);

    return () => { if (container) container.innerHTML = ''; };
  }, []);

  return <div ref={containerRef} className="hidden fixed bottom-16 right-4 z-40" />;
}
