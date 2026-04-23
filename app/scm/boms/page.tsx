import DashboardLayout from '@/components/layout/DashboardLayout';
import BomsView from '@/components/scm/boms/BomsView';

export default function BomsPage() {
  return (
    <DashboardLayout title="Recetas (BOMs)" subtitle="SCM · Bill of Materials">
      <BomsView />
    </DashboardLayout>
  );
}
