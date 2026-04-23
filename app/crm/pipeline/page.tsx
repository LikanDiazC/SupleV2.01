import DashboardLayout from '@/components/layout/DashboardLayout';
import PipelineView from '@/components/crm/PipelineView';

export default function PipelinePage() {
  return (
    <DashboardLayout title="Pipeline" subtitle="CRM · Negocios">
      <PipelineView />
    </DashboardLayout>
  );
}
