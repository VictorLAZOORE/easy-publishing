'use client';

import { useCallback, useEffect, useState } from 'react';

const DEFAULT_USER_ID = '';

export function useUserId(): [string, (id: string) => void] {
  const [userId, setUserIdState] = useState(DEFAULT_USER_ID);

  useEffect(() => {
    let alive = true;
    fetch('/api/auth/me')
      .then((r) => r.json())
      .then((data) => {
        if (!alive) return;
        setUserIdState(data?.user?.id || DEFAULT_USER_ID);
      })
      .catch(() => {
        if (!alive) return;
        setUserIdState(DEFAULT_USER_ID);
      });
    return () => {
      alive = false;
    };
  }, []);

  const setUserId = useCallback((id: string) => {
    setUserIdState(id || DEFAULT_USER_ID);
  }, []);

  return [userId, setUserId];
}

export function getUserIdForApi(): string {
  return DEFAULT_USER_ID;
}
