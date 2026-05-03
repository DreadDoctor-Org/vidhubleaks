import { useEffect, useRef, forwardRef } from 'react';

export const BannerAd728 = forwardRef<HTMLDivElement>((_, ref) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Clear any existing content
    container.innerHTML = '';

    // Create the atOptions script
    const optionsScript = document.createElement('script');
    optionsScript.type = 'text/javascript';
    optionsScript.text = `
      atOptions = {
        'key' : 'a1cfc47dbebd625859c8fd76c550ab16',
        'format' : 'iframe',
        'height' : 90,
        'width' : 728,
        'params' : {}
      };
    `;
    container.appendChild(optionsScript);

    // Create the invoke script
    const invokeScript = document.createElement('script');
    invokeScript.type = 'text/javascript';
    invokeScript.src = 'https://elegantimpose.com/a1cfc47dbebd625859c8fd76c550ab16/invoke.js';
    container.appendChild(invokeScript);

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

BannerAd728.displayName = 'BannerAd728';
