import DashboardLayout from '@/components/layout/DashboardLayout';
import RemnantsView from '@/components/scm/inventory/RemnantsView';

export default function RemnantsPage() {
  return (
    <DashboardLayout title="Retazos" subtitle="SCM · Sobrantes de plancha">
      <RemnantsView />
    </DashboardLayout>
  );
}
