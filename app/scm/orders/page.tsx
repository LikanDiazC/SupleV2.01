import DashboardLayout from '@/components/layout/DashboardLayout';
import EmptyState from '@/components/ui/EmptyState';
import { ClipboardList } from 'lucide-react';

export default function OrdersPage() {
  return (
    <DashboardLayout title="Órdenes de Producción" subtitle="SCM · Pipeline de Fábrica">
      <div className="rounded-xl border border-slate-100 bg-white p-8 shadow-card">
        <EmptyState
          icon={ClipboardList}
          title="Módulo en construcción"
          description="El pipeline de órdenes de fabricación estará disponible próximamente."
        />
      </div>
    </DashboardLayout>
  );
}
