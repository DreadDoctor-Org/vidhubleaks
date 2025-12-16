import { useEffect, useRef, forwardRef } from 'react';

export const NativeBannerAd = forwardRef<HTMLDivElement>((_, ref) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Clear any existing content
    container.innerHTML = '';

    // Create the invoke script
    const invokeScript = document.createElement('script');
    invokeScript.async = true;
    invokeScript.setAttribute('data-cfasync', 'false');
    invokeScript.src = 'https://elegantimpose.com/d3d5d75b7052cfa3e2cde771a7db2692/invoke.js';
    container.appendChild(invokeScript);

    // Create the container div
    const adContainer = document.createElement('div');
    adContainer.id = 'container-d3d5d75b7052cfa3e2cde771a7db2692';
    container.appendChild(adContainer);

    return () => {
      if (container) {
        container.innerHTML = '';
      }
    };
  }, []);

  return (
    <div ref={ref} className="w-full flex justify-center py-2">
      <div ref={containerRef} className="max-w-full overflow-hidden" />
    </div>
  );
});

NativeBannerAd.displayName = 'NativeBannerAd';
