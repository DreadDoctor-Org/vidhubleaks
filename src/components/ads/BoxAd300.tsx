import { useEffect, useRef } from 'react';

export function BoxAd300() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    container.innerHTML = '';

    const optionsScript = document.createElement('script');
    optionsScript.type = 'text/javascript';
    optionsScript.text = `
      atOptions = {
        'key' : '3412bd0740261f0cf1c34883407ce7ab',
        'format' : 'iframe',
        'height' : 250,
        'width' : 300,
        'params' : {}
      };
    `;
    container.appendChild(optionsScript);

    const invokeScript = document.createElement('script');
    invokeScript.type = 'text/javascript';
    invokeScript.src =
      'https://elegantimpose.com/3412bd0740261f0cf1c34883407ce7ab/invoke.js';
    container.appendChild(invokeScript);

    return () => {
      if (container) container.innerHTML = '';
    };
  }, []);

  return (
    <div className="col-span-full flex justify-center py-4">
      <div ref={containerRef} className="max-w-full overflow-hidden" />
    </div>
  );
}