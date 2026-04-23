import DashboardLayout from '@/components/layout/DashboardLayout';
import EmptyState from '@/components/ui/EmptyState';
import { Users } from 'lucide-react';

export default function ContactsPage() {
  return (
    <DashboardLayout title="Contactos" subtitle="CRM · Contactos">
      <div className="rounded-xl border border-slate-100 bg-white p-8 shadow-card">
        <EmptyState
          icon={Users}
          title="Módulo en construcción"
          description="La vista de Contactos estará disponible próximamente."
        />
      </div>
    </DashboardLayout>
  );
}
