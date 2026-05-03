import { useEffect } from 'react';

const SOCIAL_BAR_SRC =
  'https://elegantimpose.com/bf/db/38/bfdb3856b7a0a325240de9dda540ae32.js';

export function SocialBar() {
  useEffect(() => {
    if (document.querySelector(`script[src="${SOCIAL_BAR_SRC}"]`)) return;
    const script = document.createElement('script');
    script.type = 'text/javascript';
    script.src = SOCIAL_BAR_SRC;
    document.body.appendChild(script);
  }, []);

  return null;
}
