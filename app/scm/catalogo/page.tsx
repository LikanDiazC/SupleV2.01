import DashboardLayout from '@/components/layout/DashboardLayout';
import CatalogoView from '@/components/scm/catalogo/CatalogoView';

export default function CatalogoPage() {
  return (
    <DashboardLayout title="Catálogo Proveedores" subtitle="SCM · Productos Sodimac y Easy">
      <CatalogoView />
    </DashboardLayout>
  );
}
