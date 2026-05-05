import { API_BASE } from '@/lib/utils';
import { apiFetch } from '@/lib/apiFetch';

export interface AdCampaignDto {
  id: string;
  platform: 'GOOGLE' | 'META' | 'TIKTOK';
  name: string;
  status: 'ENABLED' | 'PAUSED' | 'REMOVED' | 'UNKNOWN';
  spend: number;
  impressions: number;
  clicks: number;
  conversions: number;
  cpc: number;
  calculatedCtr: number;
}

export interface MarketingDashboard {
  metrics: {
    totalSpend: number;
    totalImpressions: number;
    totalClicks: number;
    totalConversions: number;
    averageCpc: number;
  };
  campaigns: AdCampaignDto[];
}

export async function fetchMarketingDashboard(): Promise<MarketingDashboard> {
  const res = await apiFetch(`${API_BASE}/marketing/dashboard`);
  if (!res.ok) {
    const errorBody = await res.json().catch(() => ({}));
    throw new Error(errorBody.message || 'Error al cargar datos de Marketing');
  }
  const json = await res.json();
  return json.data;
}
