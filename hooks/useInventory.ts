'use client';

import { useState, useEffect, useCallback } from 'react';
import { type InventoryItem } from '@/types';
import { fetchInventory } from '@/services/api/inventory';

interface UseInventoryReturn {
  items: InventoryItem[];
  loading: boolean;
  refresh: () => Promise<void>;
}

export function useInventory(): UseInventoryReturn {
  const [items, setItems]     = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      setItems(await fetchInventory());
    } catch {
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  return { items, loading, refresh: load };
}
