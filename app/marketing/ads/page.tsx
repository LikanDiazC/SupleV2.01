'use client';

import { useEffect, useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { fetchMarketingDashboard, type MarketingDashboard, type AdCampaignDto } from '@/services/api/marketing';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, Legend,
  AreaChart, Area,
} from 'recharts';
import {
  DollarSign, MousePointerClick, Eye, TrendingUp, Megaphone, AlertTriangle, Loader2
} from 'lucide-react';

// ── Helpers ────────────────────────────────────────────────────────────────────

function formatCurrency(value: number) {
  return new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP', maximumFractionDigits: 0 }).format(value);
}

function formatNumber(value: number) {
  return new Intl.NumberFormat('es-CL').format(value);
}

function statusLabel(status: string) {
  switch (status) {
    case 'ENABLED': return 'Activa';
    case 'PAUSED':  return 'Pausada';
    case 'REMOVED': return 'Eliminada';
    default:        return 'Desconocido';
  }
}

function statusColor(status: string) {
  switch (status) {
    case 'ENABLED': return 'bg-emerald-100 text-emerald-700';
    case 'PAUSED':  return 'bg-amber-100 text-amber-700';
    case 'REMOVED': return 'bg-red-100 text-red-700';
    default:        return 'bg-slate-100 text-slate-500';
  }
}

const PLATFORM_COLORS: Record<string, string> = {
  GOOGLE: '#4285F4',
  META: '#1877F2',
  TIKTOK: '#010101',
};

const PLATFORM_LABELS: Record<string, string> = {
  GOOGLE: 'Google Ads',
  META: 'Meta Ads',
  TIKTOK: 'TikTok Ads',
};

// ── KPI Card ──────────────────────────────────────────────────────────────────

function KpiCard({ icon: Icon, label, value, sub, color }: {
  icon: React.ElementType; label: string; value: string; sub?: string; color: string;
}) {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-slate-100 bg-white p-5 shadow-sm transition-shadow hover:shadow-md">
      <div className={`absolute -right-4 -top-4 h-20 w-20 rounded-full opacity-10 ${color}`} />
      <div className="flex items-center gap-3 mb-3">
        <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${color} bg-opacity-10`}>
          <Icon className="h-5 w-5 text-white" />
        </div>
        <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">{label}</span>
      </div>
      <p className="text-2xl font-bold text-slate-800">{value}</p>
      {sub && <p className="mt-1 text-xs text-slate-400">{sub}</p>}
    </div>
  );
}

// ── Platform Toggle ───────────────────────────────────────────────────────────

function PlatformToggle({ platform, enabled, onToggle }: {
  platform: string; enabled: boolean; onToggle: () => void;
}) {
  return (
    <button
      onClick={onToggle}
      className={`flex items-center gap-2 rounded-full border px-4 py-2 text-xs font-semibold transition-all ${
        enabled
          ? 'border-indigo-200 bg-indigo-50 text-indigo-700 shadow-sm'
          : 'border-slate-200 bg-slate-50 text-slate-400 opacity-60'
      }`}
    >
      <span className={`h-2 w-2 rounded-full ${enabled ? 'bg-emerald-400' : 'bg-slate-300'}`} />
      {PLATFORM_LABELS[platform] || platform}
      {!enabled && <span className="text-[10px]">(Próximamente)</span>}
    </button>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────

export default function AdsPage() {
  const [data, setData] = useState<MarketingDashboard | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Platform toggles — only Google is active for now
  const [platforms] = useState({
    GOOGLE: true,
    META: false,
    TIKTOK: false,
  });

  useEffect(() => {
    fetchMarketingDashboard()
      .then(setData)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  // Chart data from campaigns
  const chartData = data?.campaigns.map((c) => ({
    name: c.name.length > 20 ? c.name.slice(0, 20) + '…' : c.name,
    Inversión: c.spend,
    Clics: c.clicks,
    Conversiones: c.conversions,
    platform: c.platform,
  })) || [];

  return (
    <DashboardLayout title="Google Ads" subtitle="Marketing · Campañas publicitarias">
      <div className="space-y-6 p-6">
        {/* Header */}
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 shadow-lg shadow-indigo-200">
              <Megaphone className="h-5 w-5 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-800">Centro de Marketing</h1>
              <p className="text-sm text-slate-400">Rendimiento de tus campañas publicitarias en tiempo real</p>
            </div>
          </div>
        </div>

        {/* Platform Toggles */}
        <div className="flex gap-3">
          {Object.entries(platforms).map(([key, enabled]) => (
            <PlatformToggle
              key={key}
              platform={key}
              enabled={enabled}
              onToggle={() => {
                if (key !== 'GOOGLE') {
                  alert(`La integración con ${PLATFORM_LABELS[key]} estará disponible próximamente.`);
                }
              }}
            />
          ))}
        </div>

        {/* Loading / Error / Content */}
        {loading ? (
          <div className="flex h-64 items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-indigo-500" />
            <p className="ml-3 text-sm text-slate-500">Consultando Google Ads…</p>
          </div>
        ) : error ? (
          <div className="rounded-2xl border border-amber-200 bg-amber-50 p-6">
            <div className="flex items-center gap-3 mb-2">
              <AlertTriangle className="h-5 w-5 text-amber-600" />
              <h3 className="text-sm font-bold text-amber-800">No se pudieron cargar los datos</h3>
            </div>
            <p className="text-xs text-amber-700">{error}</p>
            <p className="mt-2 text-xs text-amber-600">
              Asegúrate de haber configurado las variables <code className="rounded bg-amber-100 px-1">GOOGLE_ADS_DEVELOPER_TOKEN</code>, 
              <code className="rounded bg-amber-100 px-1 ml-1">GOOGLE_ADS_REFRESH_TOKEN</code> y 
              <code className="rounded bg-amber-100 px-1 ml-1">GOOGLE_ADS_CUSTOMER_ID</code> en tu archivo <code className="rounded bg-amber-100 px-1">.env</code>.
            </p>
          </div>
        ) : data ? (
          <>
            {/* KPI Cards */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <KpiCard
                icon={DollarSign}
                label="Inversión Total"
                value={formatCurrency(data.metrics.totalSpend)}
                sub="Últimos 30 días"
                color="bg-gradient-to-br from-rose-500 to-orange-500"
              />
              <KpiCard
                icon={MousePointerClick}
                label="Clics Totales"
                value={formatNumber(data.metrics.totalClicks)}
                sub={`CPC Promedio: ${formatCurrency(data.metrics.averageCpc)}`}
                color="bg-gradient-to-br from-blue-500 to-indigo-600"
              />
              <KpiCard
                icon={Eye}
                label="Impresiones"
                value={formatNumber(data.metrics.totalImpressions)}
                sub="Visibilidad de marca"
                color="bg-gradient-to-br from-emerald-500 to-teal-600"
              />
              <KpiCard
                icon={TrendingUp}
                label="Conversiones"
                value={formatNumber(data.metrics.totalConversions)}
                sub="Acciones completadas"
                color="bg-gradient-to-br from-purple-500 to-fuchsia-600"
              />
            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
              {/* Bar Chart — Spend per Campaign */}
              <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
                <h3 className="mb-4 text-sm font-bold text-slate-700">Inversión por Campaña</h3>
                <div className="h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData} margin={{ top: 5, right: 20, bottom: 50, left: 10 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                      <XAxis dataKey="name" tick={{ fontSize: 10 }} angle={-35} textAnchor="end" />
                      <YAxis tick={{ fontSize: 11 }} />
                      <Tooltip
                        formatter={(value) => formatCurrency(Number(value))}
                        contentStyle={{ borderRadius: 12, border: '1px solid #e2e8f0', fontSize: 12 }}
                      />
                      <Bar dataKey="Inversión" radius={[6, 6, 0, 0]}>
                        {chartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={PLATFORM_COLORS[entry.platform] || '#6366f1'} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Area Chart — Clicks & Conversions */}
              <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
                <h3 className="mb-4 text-sm font-bold text-slate-700">Clics vs Conversiones</h3>
                <div className="h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartData} margin={{ top: 5, right: 20, bottom: 50, left: 10 }}>
                      <defs>
                        <linearGradient id="gradClics" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                        </linearGradient>
                        <linearGradient id="gradConv" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                      <XAxis dataKey="name" tick={{ fontSize: 10 }} angle={-35} textAnchor="end" />
                      <YAxis tick={{ fontSize: 11 }} />
                      <Tooltip contentStyle={{ borderRadius: 12, border: '1px solid #e2e8f0', fontSize: 12 }} />
                      <Legend wrapperStyle={{ fontSize: 12 }} />
                      <Area type="monotone" dataKey="Clics" stroke="#6366f1" fill="url(#gradClics)" strokeWidth={2} />
                      <Area type="monotone" dataKey="Conversiones" stroke="#10b981" fill="url(#gradConv)" strokeWidth={2} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            {/* Campaigns Table */}
            <div className="rounded-2xl border border-slate-100 bg-white shadow-sm overflow-hidden">
              <div className="border-b border-slate-100 px-5 py-4">
                <h3 className="text-sm font-bold text-slate-700">Campañas Activas</h3>
                <p className="text-xs text-slate-400 mt-0.5">Detalle de rendimiento por campaña individual</p>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="bg-slate-50 text-xs font-semibold uppercase tracking-wider text-slate-400">
                    <tr>
                      <th className="px-5 py-3">Campaña</th>
                      <th className="px-5 py-3">Fuente</th>
                      <th className="px-5 py-3">Estado</th>
                      <th className="px-5 py-3 text-right">Inversión</th>
                      <th className="px-5 py-3 text-right">Impresiones</th>
                      <th className="px-5 py-3 text-right">Clics</th>
                      <th className="px-5 py-3 text-right">CPC</th>
                      <th className="px-5 py-3 text-right">Conv.</th>
                      <th className="px-5 py-3 text-right">CTR</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {data.campaigns.length === 0 ? (
                      <tr>
                        <td colSpan={9} className="px-5 py-12 text-center text-sm text-slate-400">
                          No hay campañas disponibles. Verifica tu configuración de Google Ads.
                        </td>
                      </tr>
                    ) : (
                      data.campaigns.map((c) => (
                        <tr key={c.id} className="transition-colors hover:bg-slate-50/50">
                          <td className="px-5 py-3">
                            <p className="text-sm font-semibold text-slate-800">{c.name}</p>
                            <p className="text-[10px] text-slate-400">ID: {c.id}</p>
                          </td>
                          <td className="px-5 py-3">
                            <span className="inline-flex items-center gap-1.5 text-xs font-medium" style={{ color: PLATFORM_COLORS[c.platform] }}>
                              <span className="h-2 w-2 rounded-full" style={{ background: PLATFORM_COLORS[c.platform] }} />
                              {PLATFORM_LABELS[c.platform] || c.platform}
                            </span>
                          </td>
                          <td className="px-5 py-3">
                            <span className={`inline-flex rounded-full px-2.5 py-0.5 text-[10px] font-bold ${statusColor(c.status)}`}>
                              {statusLabel(c.status)}
                            </span>
                          </td>
                          <td className="px-5 py-3 text-right text-sm font-semibold text-slate-700">{formatCurrency(c.spend)}</td>
                          <td className="px-5 py-3 text-right text-sm text-slate-600">{formatNumber(c.impressions)}</td>
                          <td className="px-5 py-3 text-right text-sm text-slate-600">{formatNumber(c.clicks)}</td>
                          <td className="px-5 py-3 text-right text-sm text-slate-600">{formatCurrency(c.cpc)}</td>
                          <td className="px-5 py-3 text-right text-sm font-semibold text-emerald-600">{formatNumber(c.conversions)}</td>
                          <td className="px-5 py-3 text-right text-sm text-slate-600">
                            {c.impressions > 0 ? ((c.clicks / c.impressions) * 100).toFixed(2) + '%' : '—'}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        ) : null}
      </div>
    </DashboardLayout>
  );
}
