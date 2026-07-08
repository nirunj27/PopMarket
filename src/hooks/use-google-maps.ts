'use client';

import { useEffect, useState } from 'react';

let scriptPromise: Promise<void> | null = null;

function loadGoogleMapsScript(apiKey: string): Promise<void> {
  if (typeof window !== 'undefined' && window.google?.maps?.places) {
    return Promise.resolve();
  }

  if (scriptPromise) return scriptPromise;

  scriptPromise = new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places&loading=async`;
    script.async = true;
    script.defer = true;
    script.onload = () => resolve();
    script.onerror = () => {
      scriptPromise = null;
      reject(new Error('Failed to load Google Maps'));
    };
    document.head.appendChild(script);
  });

  return scriptPromise;
}

export function useGoogleMaps() {
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!apiKey) return;

    loadGoogleMapsScript(apiKey)
      .then(() => setIsLoaded(true))
      .catch(() => setError('Could not load Google Maps'));
  }, [apiKey]);

  return {
    isConfigured: Boolean(apiKey),
    isLoaded,
    error,
  };
}
