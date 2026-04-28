'use client';

import { type Remnant } from '@/types';
import { Layers } from 'lucide-react';

function RemnantShape({ widthMm, heightMm }: { widthMm: number; heightMm: number }) {
  const MAX = 48;
  const ratio = widthMm / heightMm;
  const w = ratio >= 1 ? MAX : Math.round(MAX * ratio);
  const h = ratio >= 1 ? Math.round(MAX / ratio) : MAX;

  return (
    <svg width={MAX} height={MAX} viewBox={`0 0 ${MAX} ${MAX}`} className="shrink-0">
      <rect
        x={(MAX - w) / 2}
        y={(MAX - h) / 2}
        width={w}
        height={h}
        fill="#d1fae5"
        stroke="#10b981"
        strokeWidth="1.5"
        rx="2"
      />
      <line
        x1={(MAX - w) / 2}
        y1={(MAX + h) / 2}
        x2={(MAX + w) / 2}
        y2={(MAX - h) / 2}
        stroke="#10b981"
        strokeWidth="0.8"
        opacity="0.5"
      />
    </svg>
  );
}

function formatArea(mm2: number): string {
  const cm2 = mm2 / 100;
  return cm2 >= 10000
    ? `${(cm2 / 10000).toFixed(2)} m²`
    : `${cm2.toFixed(0)} cm²`;
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('es-CL', {
    day: '2-digit', month: 'short', year: 'numeric',
  });
}

interface Props {
  remnants: Remnant[];
  loading: boolean;
}

export default function RemnantsTable({ remnants, loading }: Props) {
  if (loading) {
    return (
      <div className="flex h-40 items-center justify-center text-sm text-slate-400">
        Cargando retazos...
      </div>
    );
  }

  if (remnants.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-slate-200 bg-slate-50 py-16 text-center">
        <Layers className="h-8 w-8 text-slate-300" />
        <p className="text-sm font-medium text-slate-500">Sin retazos en inventario</p>
        <p className="text-xs text-slate-400">Los retazos se generan automáticamente al completar órdenes de producción.</p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-slate-100 bg-slate-50">
            <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
              Material
            </th>
            <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
              Forma
            </th>
            <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
              Dimensiones
            </th>
            <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
              Área
            </th>
            <th className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wide text-slate-500">
              Stock
            </th>
            <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
              Orden origen
            </th>
            <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
              Creado
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {remnants.map((r) => (
            <tr key={r.id} className="hover:bg-slate-50 transition-colors">
              <td className="px-4 py-3 font-medium text-slate-800">{r.materialName}</td>
              <td className="px-4 py-3">
                <RemnantShape widthMm={r.widthMm} heightMm={r.heightMm} />
              </td>
              <td className="px-4 py-3 text-slate-600">
                {r.widthMm} × {r.heightMm} mm
              </td>
              <td className="px-4 py-3 text-slate-600">{formatArea(r.areaMm2)}</td>
              <td className="px-4 py-3 text-center">
                <span className="inline-flex items-center rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-semibold text-emerald-700">
                  {r.stock}
                </span>
              </td>
              <td className="px-4 py-3 font-mono text-xs text-slate-400">
                {r.sourceOrderId.slice(0, 8)}…
              </td>
              <td className="px-4 py-3 text-xs text-slate-400">{formatDate(r.createdAt)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
