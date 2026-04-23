import DashboardLayout from '@/components/layout/DashboardLayout';
import EmptyState from '@/components/ui/EmptyState';
import { Building2 } from 'lucide-react';

export default function CompaniesPage() {
  return (
    <DashboardLayout title="Empresas" subtitle="CRM · Empresas">
      <div className="rounded-xl border border-slate-100 bg-white p-8 shadow-card">
        <EmptyState
          icon={Building2}
          title="Módulo en construcción"
          description="La vista de Empresas estará disponible próximamente."
        />
      </div>
    </DashboardLayout>
  );
}
