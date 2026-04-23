import DashboardLayout from '@/components/layout/DashboardLayout';
import InventoryView from '@/components/scm/inventory/InventoryView';

export default function InventoryPage() {
  return (
    <DashboardLayout title="Inventario" subtitle="SCM · Materiales y productos">
      <InventoryView />
    </DashboardLayout>
  );
}
