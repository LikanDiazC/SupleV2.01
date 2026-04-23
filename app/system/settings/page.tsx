import DashboardLayout from '@/components/layout/DashboardLayout';
import EmptyState from '@/components/ui/EmptyState';
import { Settings } from 'lucide-react';

export default function SettingsPage() {
  return (
    <DashboardLayout title="Ajustes" subtitle="Sistema · Configuración general">
      <div className="rounded-xl border border-slate-100 bg-white p-8 shadow-card">
        <EmptyState
          icon={Settings}
          title="Módulo en construcción"
          description="Los ajustes estarán disponibles próximamente."
        />
      </div>
    </DashboardLayout>
  );
}
