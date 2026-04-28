'use client';

import { useMemo, useState, useEffect } from 'react';
import { BookOpen, Trash2, Eye, X, Scissors } from 'lucide-react';
import { type Bom, type BomComponent, type MaterialCuttingPreview, type SheetLayout, type CuttingRemnant } from '@/types';
import { fetchBomCuttingPreview } from '@/services/api/boms';
import ActionMenu from '@/components/ui/ActionMenu';
import EmptyState from '@/components/ui/EmptyState';
import SearchInput from '@/components/ui/SearchInput';

function SkeletonRow() {
  return (
    <tr>
      {[1, 2, 3, 4].map((i) => (
        <td key={i} className="px-4 py-3">
          <div className="h-4 animate-pulse rounded bg-slate-100" style={{ width: `${50 + i * 12}%` }} />
        </td>
      ))}
    </tr>
  );
}

const TH = ({ children }: { children: React.ReactNode }) => (
  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500">
    {children}
  </th>
);

// ─── Cutting visualization ────────────────────────────────────────────────────

const PIECE_PALETTE = [
  { fill: '#bfdbfe', stroke: '#2563eb', text: '#1e40af' },
  { fill: '#bbf7d0', stroke: '#16a34a', text: '#14532d' },
  { fill: '#fde68a', stroke: '#d97706', text: '#92400e' },
  { fill: '#f5d0fe', stroke: '#a21caf', text: '#701a75' },
  { fill: '#fed7aa', stroke: '#ea580c', text: '#7c2d12' },
  { fill: '#99f6e4', stroke: '#0d9488', text: '#134e4a' },
  { fill: '#fecaca', stroke: '#dc2626', text: '#7f1d1d' },
];

const REMNANT_FILL   = '#d1fae5';
const REMNANT_STROKE = '#059669';
const REMNANT_TEXT   = '#065f46';

function SheetDiagram({
  sheetIndex, layout, remnants, sheetWidthMm, sheetHeightMm, colorMap,
}: {
  sheetIndex: number;
  layout: SheetLayout;
  remnants: CuttingRemnant[];
  sheetWidthMm: number;
  sheetHeightMm: number;
  colorMap: Map<string, typeof PIECE_PALETTE[0]>;
}) {
  // Always display portrait sheets in landscape (transpose x↔y) so the long
  // dimension fills the modal width and pieces appear on the left side.
  const isPortrait = sheetHeightMm > sheetWidthMm;
  const viewW  = isPortrait ? sheetHeightMm : sheetWidthMm;
  const viewH  = isPortrait ? sheetWidthMm  : sheetHeightMm;

  const SVG_W   = 700;
  const scale   = SVG_W / viewW;
  const SVG_H   = Math.round(viewH * scale);
  const patId   = `grid-${sheetIndex}`;
  const hatchId = `hatch-${sheetIndex}`;

  // Transpose coordinates when displaying portrait sheet as landscape
  const tr = (x: number, y: number, w: number, h: number) =>
    isPortrait
      ? { x: y * scale, y: x * scale, w: h * scale, h: w * scale }
      : { x: x * scale, y: y * scale, w: w * scale, h: h * scale };

  const sheetRemnants = remnants.filter(r => r.sheetIndex === sheetIndex);

  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
      {/* Sheet header */}
      <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50 px-4 py-2.5">
        <span className="text-xs font-semibold text-slate-600">Plancha {sheetIndex + 1}</span>
        <span className="text-xs text-slate-400">{sheetWidthMm} × {sheetHeightMm} mm</span>
      </div>

      {/* SVG diagram */}
      <div className="p-3">
        <svg
          width="100%"
          viewBox={`0 0 ${SVG_W} ${SVG_H}`}
          className="rounded-lg"
          style={{ display: 'block' }}
        >
          <defs>
            <pattern id={patId} width="18" height="18" patternUnits="userSpaceOnUse">
              <circle cx="1" cy="1" r="0.8" fill="#e2e8f0" />
            </pattern>
            <pattern id={hatchId} width="10" height="10" patternUnits="userSpaceOnUse">
              <path d="M-2,2 l4,-4 M0,10 l10,-10 M8,12 l4,-4"
                stroke={REMNANT_STROKE} strokeWidth="1.4" strokeOpacity="0.35" />
            </pattern>
          </defs>

          {/* Sheet background */}
          <rect width={SVG_W} height={SVG_H} fill={`url(#${patId})`} />

          {/* Remnants — drawn behind pieces */}
          {sheetRemnants.map((rem, i) => {
            const { x: rx, y: ry, w: rw, h: rh } = tr(rem.x, rem.y, rem.widthMm, rem.heightMm);
            const minDim   = Math.min(rw, rh);
            const fontSize = Math.min(11, minDim * 0.16);
            // Displayed dimensions depend on transpose
            const dw = isPortrait ? rem.heightMm : rem.widthMm;
            const dh = isPortrait ? rem.widthMm  : rem.heightMm;

            return (
              <g key={`rem-${i}`}>
                <rect x={rx} y={ry} width={rw} height={rh} fill={REMNANT_FILL} />
                <rect x={rx} y={ry} width={rw} height={rh}
                  fill={`url(#${hatchId})`}
                  stroke={REMNANT_STROKE} strokeWidth={1.2}
                  strokeDasharray="6 3" rx={2} />
                {fontSize >= 5 && rw > 30 && rh > 18 && (
                  <>
                    <text x={rx + rw / 2} y={ry + rh / 2 - fontSize * 0.7}
                      textAnchor="middle" dominantBaseline="middle"
                      fontSize={fontSize} fill={REMNANT_TEXT} fontWeight="700">
                      RETAZO
                    </text>
                    <text x={rx + rw / 2} y={ry + rh / 2 + fontSize * 0.8}
                      textAnchor="middle" dominantBaseline="middle"
                      fontSize={Math.max(5, fontSize * 0.88)} fill={REMNANT_TEXT}>
                      {dw}×{dh} mm
                    </text>
                  </>
                )}
              </g>
            );
          })}

          {/* Placed pieces */}
          {layout.pieces.map((piece, i) => {
            const { x: px, y: py, w: pw, h: ph } = tr(piece.x, piece.y, piece.width, piece.height);
            const colors   = colorMap.get(piece.label) ?? PIECE_PALETTE[0];
            const minDim   = Math.min(pw, ph);
            const fontSize = Math.min(11, minDim * 0.22);

            return (
              <g key={`piece-${i}`}>
                <rect x={px} y={py} width={pw} height={ph}
                  fill={colors.fill} stroke={colors.stroke} strokeWidth={1.5} rx={2} />
                {fontSize >= 5 && pw > 20 && ph > 14 && (
                  <>
                    <text x={px + pw / 2} y={py + ph / 2 - fontSize * 0.65}
                      textAnchor="middle" dominantBaseline="middle"
                      fontSize={fontSize} fill={colors.text} fontWeight="700"
                      style={{ userSelect: 'none' }}>
                      {piece.label}
                    </text>
                    <text x={px + pw / 2} y={py + ph / 2 + fontSize * 0.85}
                      textAnchor="middle" dominantBaseline="middle"
                      fontSize={Math.max(5, fontSize * 0.85)} fill={colors.stroke}
                      style={{ userSelect: 'none' }}>
                      {piece.width}×{piece.height}
                    </text>
                  </>
                )}
              </g>
            );
          })}

          {/* Sheet border */}
          <rect width={SVG_W} height={SVG_H} fill="none" stroke="#64748b" strokeWidth={1.5} />
        </svg>
      </div>
    </div>
  );
}

function CuttingPreviewSection({ bomId }: { bomId: string }) {
  const [preview, setPreview] = useState<MaterialCuttingPreview[] | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBomCuttingPreview(bomId)
      .then(setPreview)
      .finally(() => setLoading(false));
  }, [bomId]);

  if (loading) {
    return (
      <div className="space-y-3">
        <div className="h-6 w-1/2 animate-pulse rounded bg-slate-100" />
        <div className="h-64 animate-pulse rounded-xl bg-slate-100 w-full" />
      </div>
    );
  }

  if (!preview || preview.length === 0) {
    return (
      <p className="py-8 text-center text-sm text-slate-400">
        Sin componentes de plancha con dimensiones definidas.
      </p>
    );
  }

  return (
    <div className="space-y-8">
      {preview.map((mat) => {
        const uniqueLabels = Array.from(new Set(mat.layouts.flatMap(l => l.pieces.map(p => p.label))));
        const colorMap = new Map(uniqueLabels.map((lbl, i) => [lbl, PIECE_PALETTE[i % PIECE_PALETTE.length]]));
        const totalRemnants = mat.remnants.length;

        return (
          <div key={mat.materialId} className="space-y-3">
            {/* Material info + stats */}
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-slate-800">{mat.materialName}</p>
                <p className="text-xs text-slate-400">{mat.sheetWidthMm} × {mat.sheetHeightMm} mm</p>
              </div>
              <div className="flex shrink-0 flex-col items-end gap-1">
                <span className="rounded-full bg-brand-50 px-2.5 py-0.5 text-xs font-semibold text-brand-700">
                  {mat.sheetsUsed} plancha{mat.sheetsUsed !== 1 ? 's' : ''}
                </span>
                <span className="rounded-full bg-amber-50 px-2.5 py-0.5 text-xs font-semibold text-amber-700">
                  {mat.wastePercent}% desperdicio
                </span>
              </div>
            </div>

            {/* Legend */}
            <div className="flex flex-wrap gap-x-4 gap-y-1.5 rounded-lg border border-slate-100 bg-slate-50 px-3 py-2">
              {uniqueLabels.map(lbl => {
                const c = colorMap.get(lbl)!;
                return (
                  <span key={lbl} className="flex items-center gap-1.5 text-xs font-medium text-slate-700">
                    <span className="h-3 w-3 shrink-0 rounded-sm border" style={{ background: c.fill, borderColor: c.stroke }} />
                    {lbl} mm
                  </span>
                );
              })}
              {totalRemnants > 0 && (
                <span className="flex items-center gap-1.5 text-xs font-medium text-slate-700">
                  <span className="h-3 w-3 shrink-0 rounded-sm border border-dashed"
                    style={{ background: REMNANT_FILL, borderColor: REMNANT_STROKE }} />
                  Retazo aprovechable
                </span>
              )}
            </div>

            {/* Sheet diagrams */}
            <div className={mat.layouts.length > 1 ? 'grid grid-cols-2 gap-3' : 'space-y-3'}>
              {mat.layouts.map((layout) => (
                <SheetDiagram
                  key={layout.sheetIndex}
                  sheetIndex={layout.sheetIndex}
                  layout={layout}
                  remnants={mat.remnants}
                  sheetWidthMm={mat.sheetWidthMm}
                  sheetHeightMm={mat.sheetHeightMm}
                  colorMap={colorMap}
                />
              ))}
            </div>

            {/* Remnants summary */}
            {totalRemnants > 0 && (
              <div className="rounded-xl border border-emerald-100 bg-emerald-50 p-3">
                <p className="mb-2 text-xs font-semibold text-emerald-800">
                  {totalRemnants} retazo{totalRemnants !== 1 ? 's' : ''} que entrarán al inventario
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {mat.remnants.map((rem, i) => (
                    <span key={i}
                      className="inline-flex items-center gap-1 rounded-lg border border-emerald-200 bg-white px-2 py-1 text-xs font-medium text-emerald-700 shadow-sm">
                      <span className="h-2 w-2 rounded-full bg-emerald-400" />
                      {rem.widthMm} × {rem.heightMm} mm
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

// ─── Modal ────────────────────────────────────────────────────────────────────

function ComponentsModal({ bom, onClose }: { bom: Bom; onClose: () => void }) {
  const [tab, setTab] = useState<'components' | 'cutting'>('components');

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', handler);
      document.body.style.overflow = '';
    };
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
      <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-[2px]" onClick={onClose} />

      <div className="relative z-10 flex w-full max-w-4xl flex-col rounded-2xl border border-slate-100 bg-white shadow-2xl" style={{ maxHeight: 'calc(100vh - 48px)' }}>
        {/* Header */}
        <div className="flex shrink-0 items-start justify-between border-b border-slate-100 px-6 py-5">
          <div>
            <h2 className="text-base font-semibold text-slate-900">{bom.name}</h2>
            <p className="mt-0.5 text-xs text-slate-400">
              {bom.components.length} componente{bom.components.length !== 1 ? 's' : ''}
            </p>
          </div>
          <button
            onClick={onClose}
            className="ml-4 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border border-slate-200 text-slate-400 transition hover:border-slate-300 hover:text-slate-700"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex shrink-0 gap-0 border-b border-slate-100 px-6">
          <button
            onClick={() => setTab('components')}
            className={`px-4 py-2.5 text-xs font-semibold transition border-b-2 ${
              tab === 'components'
                ? 'border-brand-500 text-brand-600'
                : 'border-transparent text-slate-400 hover:text-slate-600'
            }`}
          >
            Componentes
          </button>
          <button
            onClick={() => setTab('cutting')}
            className={`flex items-center gap-1.5 px-4 py-2.5 text-xs font-semibold transition border-b-2 ${
              tab === 'cutting'
                ? 'border-brand-500 text-brand-600'
                : 'border-transparent text-slate-400 hover:text-slate-600'
            }`}
          >
            <Scissors className="h-3.5 w-3.5" />
            Plan de Corte
          </button>
        </div>

        {/* Body */}
        <div className="overflow-y-auto flex-1 px-6 py-4">
          {tab === 'components' ? (
            bom.components.length === 0 ? (
              <p className="py-4 text-center text-sm text-slate-400">Sin componentes registrados.</p>
            ) : (
              <ul className="divide-y divide-slate-50">
                {bom.components.map((c: BomComponent, i: number) => (
                  <li key={i} className="flex items-start justify-between gap-4 py-3">
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-slate-800">
                        {c.materialName ?? c.materialId.slice(0, 8) + '…'}
                      </p>
                      {c.pieceWidthMm && c.pieceHeightMm && (
                        <p className="mt-0.5 text-xs text-slate-400">
                          {c.pieceWidthMm} × {c.pieceHeightMm} mm
                          {c.grainRequirement && c.grainRequirement !== 'ANY'
                            ? ` · Veta: ${c.grainRequirement === 'FOLLOW' ? 'Seguir' : 'Cruzar'}`
                            : ''}
                        </p>
                      )}
                      {c.pieceLabel && (
                        <p className="mt-0.5 text-xs italic text-slate-400">{c.pieceLabel}</p>
                      )}
                    </div>
                    <span className="shrink-0 rounded-full bg-brand-50 px-2.5 py-0.5 text-xs font-semibold text-brand-700">
                      ×{c.quantity}
                    </span>
                  </li>
                ))}
              </ul>
            )
          ) : (
            <CuttingPreviewSection bomId={bom.id} />
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Table ────────────────────────────────────────────────────────────────────

interface BomsTableProps {
  boms: Bom[];
  loading: boolean;
  onDelete: (id: string) => void;
  onNewBom: () => void;
}

export default function BomsTable({ boms, loading, onDelete, onNewBom }: BomsTableProps) {
  const [search, setSearch] = useState('');
  const [selectedBom, setSelectedBom] = useState<Bom | null>(null);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return q ? boms.filter((b) => b.name.toLowerCase().includes(q)) : boms;
  }, [boms, search]);

  return (
    <>
      <div className="rounded-xl border border-slate-200 bg-white shadow-card">
        {boms.length > 0 && (
          <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
            <SearchInput value={search} onChange={setSearch} placeholder="Buscar receta..." />
            <span className="text-xs text-slate-400">
              {filtered.length} de {boms.length} receta{boms.length !== 1 ? 's' : ''}
            </span>
          </div>
        )}

        <div className="overflow-x-auto">
          <table className="w-full min-w-[600px] border-collapse">
            <thead className="border-b border-slate-100 bg-slate-50/60">
              <tr>
                <TH>Nombre de la receta</TH>
                <TH>Producto final</TH>
                <TH>Componentes</TH>
                <TH>Fecha de creación</TH>
                <TH>Acciones</TH>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {loading ? (
                Array.from({ length: 4 }).map((_, i) => <SkeletonRow key={i} />)
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-2">
                    <EmptyState
                      icon={BookOpen}
                      title={search ? 'Sin resultados' : 'Sin recetas aún'}
                      description={
                        search
                          ? `No hay recetas que coincidan con "${search}".`
                          : 'Crea tu primera receta (BOM) para definir los materiales de producción.'
                      }
                      action={
                        !search ? (
                          <button
                            onClick={onNewBom}
                            className="rounded-lg bg-brand-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-brand-600"
                          >
                            + Nueva Receta
                          </button>
                        ) : undefined
                      }
                    />
                  </td>
                </tr>
              ) : (
                filtered.map((bom) => (
                  <tr key={bom.id} className="group transition hover:bg-slate-50">
                    <td className="px-4 py-3">
                      <p className="text-sm font-medium text-slate-900">{bom.name}</p>
                    </td>
                    <td className="px-4 py-3">
                      <span className="font-mono text-xs text-slate-500">
                        {bom.productId ?? '—'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => setSelectedBom(bom)}
                        className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600 transition hover:bg-brand-50 hover:text-brand-700"
                      >
                        <Eye className="h-3 w-3" />
                        {bom.components?.length ?? 0}
                      </button>
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-500">
                      {new Date(bom.createdAt).toLocaleDateString('es-CL')}
                    </td>
                    <td className="px-4 py-3">
                      <ActionMenu
                        items={[
                          {
                            label: 'Eliminar',
                            icon: Trash2,
                            danger: true,
                            onClick: () => onDelete(bom.id),
                          },
                        ]}
                      />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {selectedBom && (
        <ComponentsModal bom={selectedBom} onClose={() => setSelectedBom(null)} />
      )}
    </>
  );
}
