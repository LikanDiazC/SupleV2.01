import { getAccessToken } from '@/lib/auth';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

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
  const token = getAccessToken();
  const res = await fetch(`${API}/marketing/dashboard`, {
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });

  if (!res.ok) {
    const errorBody = await res.json().catch(() => ({}));
    throw new Error(errorBody.message || 'Error al cargar datos de Marketing');
  }

  const json = await res.json();
  return json.data;
}
