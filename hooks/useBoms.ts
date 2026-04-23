'use client';

import { useState, useEffect, useCallback } from 'react';
import { type Bom } from '@/types';
import { fetchBoms } from '@/services/api/boms';

interface UseBomsReturn {
  boms: Bom[];
  loading: boolean;
  refresh: () => Promise<void>;
}

export function useBoms(): UseBomsReturn {
  const [boms, setBoms]       = useState<Bom[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      setBoms(await fetchBoms());
    } catch {
      setBoms([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  return { boms, loading, refresh: load };
}
