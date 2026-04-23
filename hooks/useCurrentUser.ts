'use client';

import { useState, useEffect } from 'react';
import { type StoredUser, getStoredUser } from '@/lib/auth';

export function useCurrentUser(): StoredUser | null {
  const [user, setUser] = useState<StoredUser | null>(null);

  useEffect(() => {
    setUser(getStoredUser());
  }, []);

  return user;
}
