import { useEffect } from 'react';

const POPUNDER_SRC =
  'https://elegantimpose.com/8b/bb/8f/8bbb8f2b2dc5399c739363cae4fad761.js';

export function PopunderAd() {
  useEffect(() => {
    if (document.querySelector(`script[src="${POPUNDER_SRC}"]`)) return;
    const script = document.createElement('script');
    script.src = POPUNDER_SRC;
    script.async = true;
    document.body.appendChild(script);
  }, []);

  return null;
}
