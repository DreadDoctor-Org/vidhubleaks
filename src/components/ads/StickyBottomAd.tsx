import { useEffect, useRef } from 'react';

export function StickyBottomAd() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    container.innerHTML = '';

    const optionsScript = document.createElement('script');
    optionsScript.type = 'text/javascript';
    optionsScript.text = `
      atOptions = {
        'key' : '4700ecea6b93a49e0ae29dfdd21b0acd',
        'format' : 'iframe',
        'height' : 50,
        'width' : 320,
        'params' : {}
      };
    `;
    container.appendChild(optionsScript);

    const invokeScript = document.createElement('script');
    invokeScript.type = 'text/javascript';
    invokeScript.src = 'https://elegantimpose.com/4700ecea6b93a49e0ae29dfdd21b0acd/invoke.js';
    container.appendChild(invokeScript);

    return () => { if (container) container.innerHTML = ''; };
  }, []);

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 flex justify-center bg-background/90 backdrop-blur-sm border-t border-border py-1">
      <div ref={containerRef} className="max-w-full overflow-hidden" />
    </div>
  );
}
