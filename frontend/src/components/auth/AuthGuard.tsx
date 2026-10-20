"use client";

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [authorized, setAuthorized] = useState(false);

  useEffect(() => {
    const checkAuth = () => {
      const token = localStorage.getItem('access_token');
      const user = localStorage.getItem('user');
      
      let isValid = false;
      if (token) {
        if (token.startsWith('staff-token-') || token.startsWith('mock-') || token.startsWith('offline-')) {
          isValid = Boolean(user);
        } else {
          try {
            const parts = token.split('.');
            if (parts.length === 3) {
              const payload = JSON.parse(atob(parts[1]));
              if (!payload.exp || payload.exp * 1000 > Date.now()) {
                isValid = true;
              }
            } else if (user) {
              isValid = true;
            }
          } catch (e) {
            isValid = Boolean(user);
          }
        }
      }

      if (!isValid && !pathname.startsWith('/login')) {
        setAuthorized(false);
        router.push('/login');
      } else {
        setAuthorized(true);
      }
    };

    checkAuth();
  }, [pathname, router]);

  if (!authorized) {
    return <div className="flex h-screen items-center justify-center">Loading...</div>;
  }

  return <>{children}</>;
}
