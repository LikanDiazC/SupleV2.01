import DashboardLayout from '@/components/layout/DashboardLayout';
import EmptyState from '@/components/ui/EmptyState';
import { Package } from 'lucide-react';

export default function InventoryPage() {
  return (
    <DashboardLayout title="Inventario" subtitle="SCM · Control de stock">
      <div className="rounded-xl border border-slate-100 bg-white p-8 shadow-card">
        <EmptyState
          icon={Package}
          title="Módulo en construcción"
          description="La vista de Inventario estará disponible próximamente."
        />
      </div>
    </DashboardLayout>
  );
}
