import { useEffect, useRef } from 'react';

export function SidebarAd2() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    // Clear any existing content
    containerRef.current.innerHTML = '';

    // Create the invoke script
    const invokeScript = document.createElement('script');
    invokeScript.async = true;
    invokeScript.setAttribute('data-cfasync', 'false');
    invokeScript.src = 'https://elegantimpose.com/cf2f0148a0364d1d54a48c731fddbb60/invoke.js';
    containerRef.current.appendChild(invokeScript);

    // Create the container div
    const adContainer = document.createElement('div');
    adContainer.id = 'container-cf2f0148a0364d1d54a48c731fddbb60';
    containerRef.current.appendChild(adContainer);

    return () => {
      if (containerRef.current) {
        containerRef.current.innerHTML = '';
      }
    };
  }, []);

  return (
    <div className="w-full py-2">
      <div ref={containerRef} className="max-w-full overflow-hidden" />
    </div>
  );
}
