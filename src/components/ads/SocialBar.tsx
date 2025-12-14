import { useEffect } from 'react';

export function SocialBar() {
  useEffect(() => {
    // Check if script already exists
    const existingScript = document.querySelector('script[src*="7338e69a06a3ba20c8eb64be8062563a.js"]');
    if (existingScript) return;

    // Create the social bar script
    const script = document.createElement('script');
    script.type = 'text/javascript';
    script.src = 'https://elegantimpose.com/73/38/e6/7338e69a06a3ba20c8eb64be8062563a.js';
    document.body.appendChild(script);

    return () => {
      // Cleanup not needed for social bar as it should persist
    };
  }, []);

  return null; // Social bar renders itself via the script
}
