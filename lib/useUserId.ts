'use client';

import { useCallback, useEffect, useState } from 'react';

const STORAGE_KEY = 'uid';
const DEFAULT_USER_ID = 'default';

export function useUserId(): [string, (id: string) => void] {
  const [userId, setUserIdState] = useState(DEFAULT_USER_ID);

  useEffect(() => {
    setUserIdState(typeof window !== 'undefined' ? (localStorage.getItem(STORAGE_KEY) || DEFAULT_USER_ID) : DEFAULT_USER_ID);
  }, []);

  const setUserId = useCallback((id: string) => {
    localStorage.setItem(STORAGE_KEY, id);
    setUserIdState(id);
  }, []);

  return [userId, setUserId];
}

export function getUserIdForApi(): string {
  if (typeof window === 'undefined') return DEFAULT_USER_ID;
  return localStorage.getItem(STORAGE_KEY) || DEFAULT_USER_ID;
}
