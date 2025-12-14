import { useEffect, useRef } from 'react';

export function SidebarAd1() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    // Clear any existing content
    containerRef.current.innerHTML = '';

    // Create the invoke script
    const invokeScript = document.createElement('script');
    invokeScript.async = true;
    invokeScript.setAttribute('data-cfasync', 'false');
    invokeScript.src = 'https://elegantimpose.com/2950e89ded38fef1aad1eb14b3474f37/invoke.js';
    containerRef.current.appendChild(invokeScript);

    // Create the container div
    const adContainer = document.createElement('div');
    adContainer.id = 'container-2950e89ded38fef1aad1eb14b3474f37';
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
