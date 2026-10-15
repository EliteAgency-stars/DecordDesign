'use client';
import { useEffect, useRef } from 'react';

const SITE_KEY = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;

declare global {
  interface Window {
    turnstile?: { render: (el: HTMLElement, o: { sitekey: string; callback: (t: string) => void; language: string }) => string; remove: (id: string) => void };
  }
}

// Cloudflare Turnstile; sin NEXT_PUBLIC_TURNSTILE_SITE_KEY no se muestra (quedan el honeypot y el límite por IP).
export function Turnstile({ onToken }: { onToken: (t: string) => void }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!SITE_KEY) return;
    let id: string | undefined;
    const pintar = () => (id = window.turnstile!.render(ref.current!, { sitekey: SITE_KEY, callback: onToken, language: 'es' }));
    if (window.turnstile) pintar();
    else {
      const s = document.createElement('script');
      s.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit';
      s.async = true;
      s.onload = pintar;
      document.head.appendChild(s);
    }
    return () => {
      if (id) window.turnstile?.remove(id);
    };
  }, [onToken]);
  return SITE_KEY ? <div ref={ref} /> : null;
}
