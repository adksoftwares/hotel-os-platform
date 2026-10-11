import { useState, useEffect } from 'react';
import { processSyncQueue } from '../lib/offlineSync';

export function useOfflineStatus() {
  const [isOffline, setIsOffline] = useState(false);

  useEffect(() => {
    const handleOnline = () => {
      setIsOffline(false);
      processSyncQueue(); // Trigger background sync when coming online
    };
    
    const handleOffline = () => {
      setIsOffline(true);
    };

    // Initial check
    setIsOffline(!navigator.onLine);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return isOffline;
}
