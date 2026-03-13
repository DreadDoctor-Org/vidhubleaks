import { useEffect, useRef } from 'react';

export function PopunderAd() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    container.innerHTML = '';

    const script = document.createElement('script');
    script.src = 'https://elegantimpose.com/ee/d6/d5/eed6d57092494acaea0f43b5f48789bf.js';
    container.appendChild(script);

    return () => { if (container) container.innerHTML = ''; };
  }, []);

  return <div ref={containerRef} className="hidden" />;
}
