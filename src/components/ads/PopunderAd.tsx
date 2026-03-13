import { useEffect, useRef } from 'react';

export function PopunderAd() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    container.innerHTML = '';

    const script = document.createElement('script');
    script.src = 'https://elegantimpose.com/5e/54/55/5e54554abda5df1c68cff7f7f4a68b28.js';
    container.appendChild(script);

    return () => { if (container) container.innerHTML = ''; };
  }, []);

  return <div ref={containerRef} className="hidden" />;
}
