'use client';

import { useState, useEffect, useCallback } from 'react';
import { type MarketplaceProduct } from '@/types';
import { fetchMarketplaceProducts } from '@/services/api/marketplace';

interface UseMarketplaceParams {
  search?: string;
  tienda?: string;
  categoria?: string;
  page?: number;
}

export function useMarketplace(params: UseMarketplaceParams) {
  const [items, setItems]     = useState<MarketplaceProduct[]>([]);
  const [total, setTotal]     = useState(0);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetchMarketplaceProducts({ ...params, limit: 50 });
      setItems(data.items);
      setTotal(data.total);
    } catch {
      setItems([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  }, [params.search, params.tienda, params.categoria, params.page]);

  useEffect(() => { load(); }, [load]);

  return { items, total, loading };
}
