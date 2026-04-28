import DashboardLayout from '@/components/layout/DashboardLayout';
import TeamPanel from '@/components/hr/TeamPanel';

export default function TeamPage() {
  return (
    <DashboardLayout title="Equipo" subtitle="RRHH · Gestión de personal">
      <TeamPanel />
    </DashboardLayout>
  );
}
