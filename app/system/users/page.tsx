import DashboardLayout from '@/components/layout/DashboardLayout';
import EmptyState from '@/components/ui/EmptyState';
import { UserCog } from 'lucide-react';

export default function UsersPage() {
  return (
    <DashboardLayout title="Usuarios" subtitle="Sistema · Gestión de acceso">
      <div className="rounded-xl border border-slate-100 bg-white p-8 shadow-card">
        <EmptyState
          icon={UserCog}
          title="Módulo en construcción"
          description="La gestión de usuarios estará disponible próximamente."
        />
      </div>
    </DashboardLayout>
  );
}
