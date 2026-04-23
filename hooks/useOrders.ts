'use client';

import { useState, useEffect, useCallback } from 'react';
import { type ProductionOrder } from '@/types';
import { fetchOrders } from '@/services/api/orders';

interface UseOrdersReturn {
  orders: ProductionOrder[];
  loading: boolean;
  refresh: () => Promise<void>;
}

export function useOrders(): UseOrdersReturn {
  const [orders, setOrders]   = useState<ProductionOrder[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      setOrders(await fetchOrders());
    } catch {
      setOrders([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  return { orders, loading, refresh: load };
}
