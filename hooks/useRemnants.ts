'use client';

import { useState, useEffect, useCallback } from 'react';
import { type Remnant } from '@/types';
import { fetchRemnants } from '@/services/api/inventory';

interface UseRemnantsReturn {
  remnants: Remnant[];
  loading: boolean;
  refresh: () => Promise<void>;
}

export function useRemnants(): UseRemnantsReturn {
  const [remnants, setRemnants] = useState<Remnant[]>([]);
  const [loading, setLoading]   = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      setRemnants(await fetchRemnants());
    } catch {
      setRemnants([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  return { remnants, loading, refresh: load };
}
