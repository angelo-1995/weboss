import { useEffect, useState, useCallback } from 'react';

const STORAGE_KEY = 'pending-cell-report';

export function useOfflineReport() {
  const [isOnline, setIsOnline] = useState(true);
  const [hasPending, setHasPending] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    setIsOnline(navigator.onLine);
    setHasPending(!!localStorage.getItem(STORAGE_KEY));

    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const saveOffline = useCallback((data: any) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    setHasPending(true);
  }, []);

  const getPending = useCallback((): any | null => {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    try {
      return JSON.parse(raw);
    } catch {
      return null;
    }
  }, []);

  const clearPending = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    setHasPending(false);
  }, []);

  return {
    isOnline,
    hasPending,
    saveOffline,
    getPending,
    clearPending,
  };
}
