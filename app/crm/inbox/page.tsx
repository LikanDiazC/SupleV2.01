import DashboardLayout from '@/components/layout/DashboardLayout';
import EmptyState from '@/components/ui/EmptyState';
import { Inbox } from 'lucide-react';

export default function InboxPage() {
  return (
    <DashboardLayout title="Inbox IA" subtitle="CRM · Correos inteligentes">
      <div className="rounded-xl border border-slate-100 bg-white p-8 shadow-card">
        <EmptyState
          icon={Inbox}
          title="Módulo en construcción"
          description="El Inbox IA estará disponible próximamente."
        />
      </div>
    </DashboardLayout>
  );
}
