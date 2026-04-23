import DashboardLayout from '@/components/layout/DashboardLayout';
import HomeDashboard from '@/components/overview/HomeDashboard';

export default function OverviewPage() {
  return (
    <DashboardLayout title="Inicio" subtitle="Resumen general de tu empresa">
      <HomeDashboard />
    </DashboardLayout>
  );
}
