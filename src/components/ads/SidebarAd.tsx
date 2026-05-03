import { useEffect, useRef } from 'react';

export function SidebarAd() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    container.innerHTML = '';

    const invokeScript = document.createElement('script');
    invokeScript.async = true;
    invokeScript.setAttribute('data-cfasync', 'false');
    invokeScript.src =
      'https://elegantimpose.com/73a2ff5ebe99a81f0fa690a69dd9c65e/invoke.js';
    container.appendChild(invokeScript);

    const adContainer = document.createElement('div');
    adContainer.id = 'container-73a2ff5ebe99a81f0fa690a69dd9c65e';
    container.appendChild(adContainer);

    return () => {
      if (container) container.innerHTML = '';
    };
  }, []);

  return <div ref={containerRef} className="w-full" />;
}