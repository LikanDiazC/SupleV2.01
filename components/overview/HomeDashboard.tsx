'use client';

import { useOverviewData } from '@/hooks/useOverviewData';
import GreetingHero from './GreetingHero';
import DealsWidget from './DealsWidget';
import OrdersWidget from './OrdersWidget';
import InboxWidget from './InboxWidget';

export default function HomeDashboard() {
  const { recentDeals, activeOrders, recentEmails, loading } = useOverviewData();

  return (
    <div className="mx-auto max-w-6xl">
      <GreetingHero />

      {/* Bento grid */}
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {/* CRM — spans 1 col */}
        <DealsWidget deals={recentDeals} loading={loading} />

        {/* Producción — spans 1 col */}
        <OrdersWidget orders={activeOrders} loading={loading} />

        {/* Inbox — spans 1 col on xl, full row on md */}
        <div className="md:col-span-2 xl:col-span-1">
          <InboxWidget emails={recentEmails} loading={loading} />
        </div>
      </div>
    </div>
  );
}
