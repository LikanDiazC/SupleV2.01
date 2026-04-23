'use client';

import { useState, useEffect, useCallback } from 'react';
import { type Deal } from '@/types';
import { fetchDeals } from '@/services/api/deals';

interface UseDealsReturn {
  deals: Deal[];
  loading: boolean;
  refreshing: boolean;
  refresh: () => Promise<void>;
}

export function useDeals(): UseDealsReturn {
  const [deals, setDeals] = useState<Deal[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async (silent = false) => {
    if (silent) setRefreshing(true);
    else setLoading(true);

    try {
      const data = await fetchDeals();
      setDeals(data);
    } catch {
      setDeals([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return { deals, loading, refreshing, refresh: () => load(true) };
}
