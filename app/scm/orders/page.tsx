import DashboardLayout from '@/components/layout/DashboardLayout';
import OrdersView from '@/components/scm/orders/OrdersView';

export default function OrdersPage() {
  return (
    <DashboardLayout title="Órdenes de Producción" subtitle="SCM · Pipeline de fábrica">
      <OrdersView />
    </DashboardLayout>
  );
}
