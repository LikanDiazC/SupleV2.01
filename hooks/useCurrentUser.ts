'use client';

import { useState, useEffect } from 'react';
import { type StoredUser, getStoredUser } from '@/lib/auth';

interface UseCurrentUserReturn {
  user: StoredUser | null;
  loading: boolean;
}

export function useCurrentUser(): UseCurrentUserReturn {
  const [user, setUser]       = useState<StoredUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setUser(getStoredUser());
    setLoading(false);
  }, []);

  return { user, loading };
}
