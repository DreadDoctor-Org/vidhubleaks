import { useEffect, useRef } from 'react';

export function NativeBannerAd() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    // Clear any existing content
    containerRef.current.innerHTML = '';

    // Create the invoke script
    const invokeScript = document.createElement('script');
    invokeScript.async = true;
    invokeScript.setAttribute('data-cfasync', 'false');
    invokeScript.src = 'https://elegantimpose.com/d3d5d75b7052cfa3e2cde771a7db2692/invoke.js';
    containerRef.current.appendChild(invokeScript);

    // Create the container div
    const adContainer = document.createElement('div');
    adContainer.id = 'container-d3d5d75b7052cfa3e2cde771a7db2692';
    containerRef.current.appendChild(adContainer);

    return () => {
      if (containerRef.current) {
        containerRef.current.innerHTML = '';
      }
    };
  }, []);

  return (
    <div className="w-full flex justify-center py-2">
      <div ref={containerRef} className="max-w-full overflow-hidden" />
    </div>
  );
}
