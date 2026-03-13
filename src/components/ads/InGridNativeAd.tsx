import { useEffect, useRef } from 'react';

export function InGridNativeAd() {
  const containerRef = useRef<HTMLDivElement>(null);
  const idRef = useRef(`native-ad-${Math.random().toString(36).slice(2, 10)}`);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    container.innerHTML = '';

    const invokeScript = document.createElement('script');
    invokeScript.async = true;
    invokeScript.setAttribute('data-cfasync', 'false');
    invokeScript.src = 'https://elegantimpose.com/d3d5d75b7052cfa3e2cde771a7db2692/invoke.js';
    container.appendChild(invokeScript);

    const adContainer = document.createElement('div');
    adContainer.id = idRef.current;
    container.appendChild(adContainer);

    return () => { if (container) container.innerHTML = ''; };
  }, []);

  return (
    <div className="col-span-full flex justify-center py-4">
      <div ref={containerRef} className="max-w-full overflow-hidden" />
    </div>
  );
}
