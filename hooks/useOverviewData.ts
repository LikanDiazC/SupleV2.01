'use client';

import { useState, useEffect } from 'react';
import { type Deal, type ProductionOrder, type InboxEmail } from '@/types';
import { fetchDeals } from '@/services/api/deals';
import { fetchActiveOrders } from '@/services/api/orders';
import { fetchInboxEmails } from '@/services/api/inbox';

interface OverviewData {
  recentDeals: Deal[];
  activeOrders: ProductionOrder[];
  recentEmails: InboxEmail[];
  loading: boolean;
}

export function useOverviewData(): OverviewData {
  const [recentDeals, setRecentDeals]     = useState<Deal[]>([]);
  const [activeOrders, setActiveOrders]   = useState<ProductionOrder[]>([]);
  const [recentEmails, setRecentEmails]   = useState<InboxEmail[]>([]);
  const [loading, setLoading]             = useState(true);

  useEffect(() => {
    Promise.all([
      fetchDeals().then((d) => d.slice(0, 3)),
      fetchActiveOrders(),
      fetchInboxEmails(2),
    ])
      .then(([deals, orders, emails]) => {
        setRecentDeals(deals);
        setActiveOrders(orders);
        setRecentEmails(emails);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return { recentDeals, activeOrders, recentEmails, loading };
}
