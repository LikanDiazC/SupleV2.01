import DashboardLayout from '@/components/layout/DashboardLayout';
import EmptyState from '@/components/ui/EmptyState';
import { BookOpen } from 'lucide-react';

export default function BomsPage() {
  return (
    <DashboardLayout title="Recetas (BOMs)" subtitle="SCM · Bill of Materials">
      <div className="rounded-xl border border-slate-100 bg-white p-8 shadow-card">
        <EmptyState
          icon={BookOpen}
          title="Módulo en construcción"
          description="El módulo de Recetas estará disponible próximamente."
        />
      </div>
    </DashboardLayout>
  );
}
