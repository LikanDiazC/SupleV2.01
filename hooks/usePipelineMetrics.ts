import { useMemo } from 'react';
import { type Deal, type PipelineMetrics } from '@/types';

export function usePipelineMetrics(deals: Deal[]): PipelineMetrics {
  return useMemo(() => {
    const activeDeals = deals.filter(
      (d) => d.stage !== 'GANADO' && d.stage !== 'PERDIDO'
    ).length;

    const pipelineValue = deals
      .filter((d) => d.stage !== 'PERDIDO')
      .reduce((sum, d) => sum + d.amount, 0);

    const closeRate =
      deals.length === 0
        ? 0
        : Math.round(
            (deals.filter((d) => d.stage === 'GANADO').length / deals.length) * 100
          );

    const aiEmails = deals.filter((d) => !!d.lastAiActivity).length;

    return { activeDeals, pipelineValue, closeRate, aiEmails };
  }, [deals]);
}
