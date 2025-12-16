import { useEffect, useRef, forwardRef } from 'react';

export const SidebarAd2 = forwardRef<HTMLDivElement>((_, ref) => {
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
    invokeScript.src = 'https://elegantimpose.com/cf2f0148a0364d1d54a48c731fddbb60/invoke.js';
    container.appendChild(invokeScript);

    // Create the container div
    const adContainer = document.createElement('div');
    adContainer.id = 'container-cf2f0148a0364d1d54a48c731fddbb60';
    container.appendChild(adContainer);

    return () => {
      if (container) {
        container.innerHTML = '';
      }
    };
  }, []);

  return (
    <div ref={ref} className="w-full py-2">
      <div ref={containerRef} className="max-w-full overflow-hidden" />
    </div>
  );
});

SidebarAd2.displayName = 'SidebarAd2';
