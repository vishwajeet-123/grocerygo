import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Protect against Google Maps JS API InvalidKeyMapError halts
if (typeof window !== 'undefined') {
  (window as any).gm_authFailure = () => {
    console.warn(
      '[GroceryGo Maps] Google Maps API key authentication failure (InvalidKeyMapError). Switching smoothly to vector map engine.'
    );
    window.dispatchEvent(new CustomEvent('gmp-auth-failed'));
  };

  window.addEventListener(
    'error',
    (event) => {
      const msg = event.message || '';
      const file = event.filename || '';
      if (
        msg.includes('InvalidKeyMapError') ||
        msg.includes('Google Maps') ||
        file.includes('maps.googleapis.com')
      ) {
        console.warn('[GroceryGo Maps] Suppressed external Google Maps script error:', msg);
        event.preventDefault();
        event.stopPropagation();
        window.dispatchEvent(new CustomEvent('gmp-auth-failed'));
        return true;
      }
    },
    true
  );
}

createRoot(document.getElementById('root')!).render(<App />);

