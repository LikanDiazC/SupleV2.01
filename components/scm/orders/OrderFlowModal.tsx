'use client';

import { useState, useEffect, useMemo } from 'react';
import { Clock, X } from 'lucide-react';
import { useOrderFlow } from '@/hooks/useOrderFlow';
import type { FlowStep } from '@/hooks/useOrderFlow';

interface Props {
  orderId: string;
  onClose: () => void;
}

type NodeStatus = 'done' | 'active' | 'blocked' | 'pending';

const STATUS_COLORS: Record<NodeStatus, { bg: string; text: string; border: string; hex: string }> = {
  done:    { bg: '#F0FDF4', text: '#166534', border: '#16A34A', hex: '#16A34A' },
  active:  { bg: '#FFFBEB', text: '#92400E', border: '#D97706', hex: '#D97706' },
  blocked: { bg: '#FEF2F2', text: '#991B1B', border: '#D97706', hex: '#D97706' },
  pending: { bg: '#F9FAFB', text: '#6B7280', border: '#D1D5DB', hex: '#9CA3AF' },
};

function formatCurrency(val: number) {
  return new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP' }).format(val);
}

function statusLabel(s: NodeStatus) {
  if (s === 'done')    return 'Completado';
  if (s === 'blocked') return 'Bloqueado';
  if (s === 'active')  return 'En Progreso';
  return 'Pendiente';
}

interface SvgNode {
  id: string;
  type: 'start' | 'end' | 'gateway' | 'task';
  x: number; y: number;
  width: number; height: number;
  status: NodeStatus;
  data?: FlowStep;
}

interface SvgLink {
  from: SvgNode; to: SvgNode;
  label: string;
  type: 'normal' | 'main-bypass' | 'branch-in' | 'branch-out';
}

const ACTION_FOR_STATUS: Record<string, { label: string; action: import('@/services/api/orders').OrderAction; variant: 'primary' | 'danger' }> = {
  READY_TO_START:    { label: 'Iniciar Producción',      action: 'start-production',    variant: 'primary' },
  IN_PRODUCTION:     { label: 'Marcar Fabricado',        action: 'complete-production', variant: 'primary' },
  MANUFACTURED:      { label: 'Marcar Enviado',          action: 'ship',                variant: 'primary' },
  SHIPPED:           { label: 'Confirmar Entrega',       action: 'deliver',             variant: 'primary' },
  ON_HOLD_MATERIALS: { label: 'Reintentar Verificación', action: 'check-stock',         variant: 'danger'  },
};

export default function OrderFlowModal({ orderId, onClose }: Props) {
  const { data, loading, advancing, error, advance } = useOrderFlow(orderId);
  const [selectedStepId, setSelectedStepId] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    document.body.style.overflow = 'hidden';
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', onKey);
    };
  }, [onClose]);

  useEffect(() => {
    if (data && data.steps.length > 0 && !selectedStepId) {
      const blocked = data.steps.find((s) => s.status === 'blocked');
      if (blocked) { setSelectedStepId(blocked.id); return; }
      const active = data.steps.find((s) => s.status === 'active');
      setSelectedStepId(active ? active.id : data.steps[0].id);
    }
  }, [data, selectedStepId]);

  const nodesInfo = useMemo(() => {
    if (!data) return { nodes: [], links: [], nodeMap: {} as Record<string, SvgNode>, totalWidth: 0 };

    const nodes: SvgNode[] = [];
    const links: SvgLink[] = [];
    let cx = 40;
    const Y_MAIN = 80;
    const Y_BRANCH = 165;
    const GAP = 70;

    nodes.push({ id: 'start', type: 'start', x: cx, y: Y_MAIN - 12, width: 24, height: 24, status: 'done' });
    cx += 24 + GAP;

    data.steps.forEach((step) => {
      const type = (step.type ?? 'task') as 'task' | 'gateway';
      let w = 100, h = 52, yOff = 26;
      if (type === 'gateway') { w = 48; h = 48; yOff = 24; }
      const yPos = step.id === 'ON_HOLD_MATERIALS' ? Y_BRANCH - yOff : Y_MAIN - yOff;
      nodes.push({ id: step.id, type, x: cx, y: yPos, width: w, height: h, status: step.status as NodeStatus, data: step });
      cx += w + GAP;
    });

    const lastStep = data.steps[data.steps.length - 1];
    const endStatus: NodeStatus = lastStep?.status === 'done' ? 'done' : 'pending';
    nodes.push({ id: 'end', type: 'end', x: cx, y: Y_MAIN - 12, width: 24, height: 24, status: endStatus });
    cx += 24 + 40;

    const nodeMap = Object.fromEntries(nodes.map((n) => [n.id, n])) as Record<string, SvgNode>;

    const addLink = (fromId: string, toId: string, label = '', type: SvgLink['type'] = 'normal') => {
      const from = nodeMap[fromId];
      const to = nodeMap[toId];
      if (from && to) links.push({ from, to, label, type });
    };

    addLink('start',             'ORDER_RECEIVED');
    addLink('ORDER_RECEIVED',    'CHECKING_STOCK');
    addLink('CHECKING_STOCK',    'READY_TO_START',   'Stock ok',          'main-bypass');
    addLink('CHECKING_STOCK',    'ON_HOLD_MATERIALS', 'Stock insuficiente', 'branch-in');
    addLink('ON_HOLD_MATERIALS', 'READY_TO_START',   '',                  'branch-out');
    addLink('READY_TO_START',    'IN_PRODUCTION');
    addLink('IN_PRODUCTION',     'MANUFACTURED');
    addLink('MANUFACTURED',      'SHIPPED');
    addLink('SHIPPED',           'DELIVERED');
    addLink('DELIVERED',         'end');

    return { nodes, links, nodeMap, totalWidth: cx };
  }, [data]);

  if (!mounted) return null;

  const selectedStep = data?.steps.find((s) => s.id === selectedStepId) ?? null;
  const stColor = STATUS_COLORS[(selectedStep?.status as NodeStatus) ?? 'pending'];

  const lastActive = [...nodesInfo.nodes].reverse().find(
    (n) => n.status === 'done' || n.status === 'active' || n.status === 'blocked'
  );

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/45 backdrop-blur-sm"
      onClick={onClose}
      aria-modal="true"
      role="dialog"
    >
      <div
        className="relative flex flex-col w-full max-w-[920px] max-h-[90vh] bg-white rounded-lg shadow-[0_4px_24px_rgba(0,0,0,0.10)] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {loading || !data ? (
          <div className="p-12 text-center text-gray-500">Cargando flujo de orden...</div>
        ) : (
          <>
            {/* Header */}
            <div className="flex items-start justify-between p-6 border-b border-gray-200">
              <div>
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">
                  Producción / Órdenes / {data.id}
                </p>
                <h2 className="text-lg font-medium text-gray-900 mb-3">{data.name}</h2>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-indigo-50 border border-indigo-200 text-indigo-700">
                    Cliente: {data.client}
                  </span>
                  {data.dueDate && (
                    <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium bg-amber-50 border border-amber-200 text-amber-700">
                      <Clock className="w-3 h-3" />
                      Entrega: {data.dueDate}
                    </span>
                  )}
                </div>
              </div>
              <div className="flex flex-col items-end gap-3">
                <button
                  onClick={onClose}
                  className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-md transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
                {data.value > 0 && (
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-900">{formatCurrency(data.value)}</p>
                    <p className="text-xs text-gray-500">Valor de contrato</p>
                  </div>
                )}
              </div>
            </div>

            {/* SVG Flow */}
            <div className="relative w-full border-b border-gray-200 bg-gray-50/50 p-4 overflow-x-auto">
              <svg
                width={nodesInfo.totalWidth}
                height="260"
                className="select-none mx-auto"
              >
                <defs>
                  <marker id="arrow-done"    viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                    <path d="M 0 0 L 10 5 L 0 10 z" fill={STATUS_COLORS.done.hex} />
                  </marker>
                  <marker id="arrow-pending" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                    <path d="M 0 0 L 10 5 L 0 10 z" fill={STATUS_COLORS.pending.hex} />
                  </marker>
                  <marker id="arrow-blocked" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                    <path d="M 0 0 L 10 5 L 0 10 z" fill={STATUS_COLORS.blocked.hex} />
                  </marker>
                </defs>

                {/* Progress baseline */}
                <line x1="40" y1="230" x2={Math.max(40, nodesInfo.totalWidth - 40)} y2="230" stroke="#E5E7EB" strokeWidth="2" />
                {lastActive && (
                  <line x1="40" y1="230" x2={lastActive.x + lastActive.width / 2} y2="230" stroke={STATUS_COLORS.done.hex} strokeWidth="2" />
                )}

                {/* Links */}
                {nodesInfo.links.map((link, i) => {
                  const fromDone   = link.from.status === 'done';
                  const toStarted  = ['done', 'active', 'blocked'].includes(link.to.status);
                  const confirmNode = nodesInfo.nodeMap['ON_HOLD_MATERIALS'];
                  const confirmActive = confirmNode && ['done', 'active', 'blocked'].includes(confirmNode.status);

                  let stroke = STATUS_COLORS.pending.hex;
                  let marker = 'url(#arrow-pending)';
                  let dash: string | undefined;

                  if (link.type === 'main-bypass') {
                    dash = '5 4';
                    if (fromDone && toStarted && !confirmActive) {
                      stroke = STATUS_COLORS.done.hex; marker = 'url(#arrow-done)';
                    }
                  } else if (link.type === 'branch-in' || link.type === 'branch-out') {
                    dash = '5 4';
                    if (fromDone && confirmActive) {
                      stroke = STATUS_COLORS.blocked.hex; marker = 'url(#arrow-blocked)';
                    }
                  } else {
                    if (fromDone && toStarted) {
                      stroke = STATUS_COLORS.done.hex; marker = 'url(#arrow-done)';
                    }
                  }

                  let path = '';
                  let labelPos: { x: number; y: number } | null = null;

                  if (link.type === 'branch-in') {
                    const sx = link.from.x + link.from.width / 2;
                    const sy = link.from.y + link.from.height;
                    const ex = link.to.x;
                    const ey = link.to.y + link.to.height / 2;
                    path = `M ${sx} ${sy} L ${sx} ${ey} L ${ex} ${ey}`;
                    labelPos = { x: sx + 12, y: ey - 8 };
                  } else if (link.type === 'branch-out') {
                    const sx = link.from.x + link.from.width;
                    const sy = link.from.y + link.from.height / 2;
                    const ex = link.to.x + link.to.width / 2;
                    const ey = link.to.y + link.to.height;
                    path = `M ${sx} ${sy} L ${ex} ${sy} L ${ex} ${ey}`;
                  } else {
                    const sx = link.from.x + link.from.width;
                    const sy = link.from.y + link.from.height / 2;
                    const ex = link.to.x;
                    const ey = link.to.y + link.to.height / 2;
                    path = `M ${sx} ${sy} L ${ex} ${ey}`;
                    if (link.label) labelPos = { x: sx + 15, y: sy - 8 };
                  }

                  return (
                    <g key={`link-${i}`}>
                      <path d={path} fill="none" stroke={stroke} strokeWidth="1.5" strokeDasharray={dash} markerEnd={marker} />
                      {labelPos && link.label && (
                        <text x={labelPos.x} y={labelPos.y} fill={stroke} fontSize="11" fontWeight="600">
                          {link.label}
                        </text>
                      )}
                    </g>
                  );
                })}

                {/* Nodes */}
                {nodesInfo.nodes.map((n) => {
                  const isSelected = selectedStepId === n.id;
                  const c = STATUS_COLORS[n.status] ?? STATUS_COLORS.pending;

                  return (
                    <g
                      key={n.id}
                      transform={`translate(${n.x}, ${n.y})`}
                      onClick={() => { if (n.type === 'task' || n.type === 'gateway') setSelectedStepId(n.id); }}
                      className={n.type === 'task' || n.type === 'gateway' ? 'cursor-pointer' : ''}
                    >
                      {isSelected && (
                        <rect x="-4" y="-4" width={n.width + 8} height={n.height + 8} rx={n.type === 'gateway' ? 24 : 9} fill="none" stroke="#3B82F6" strokeWidth="2" />
                      )}

                      {n.type === 'start' && (
                        <circle cx={12} cy={12} r={12} fill="#fff" stroke={c.hex} strokeWidth="2" />
                      )}

                      {n.type === 'end' && (
                        <circle cx={12} cy={12} r={12} fill="#fff" stroke={c.hex} strokeWidth="3" />
                      )}

                      {n.type === 'gateway' && (
                        <path
                          d={`M ${n.width / 2} 0 L ${n.width} ${n.height / 2} L ${n.width / 2} ${n.height} L 0 ${n.height / 2} Z`}
                          fill="#fff"
                          stroke={n.status === 'blocked' ? '#D97706' : '#E5E7EB'}
                          strokeWidth={n.status === 'blocked' ? 1.5 : 1}
                        />
                      )}

                      {n.type === 'task' && (
                        <>
                          <rect width={n.width} height={n.height} rx="7" fill="#fff" stroke={n.status === 'blocked' ? '#D97706' : '#E5E7EB'} strokeWidth={n.status === 'blocked' ? 1.5 : 1} />
                          <path d={`M 0 7 A 7 7 0 0 1 7 0 L 4 0 L 4 ${n.height} L 7 ${n.height} A 7 7 0 0 1 0 ${n.height - 7} Z`} fill={c.hex} />
                          <foreignObject x="8" y="0" width={n.width - 12} height={n.height}>
                            <div className="w-full h-full flex items-center p-1 overflow-hidden" style={{ fontSize: '10px', lineHeight: '1.2' }}>
                              <span className="text-gray-700 font-medium text-center w-full break-words line-clamp-3">
                                {n.data?.label}
                              </span>
                            </div>
                          </foreignObject>
                          {n.status === 'blocked' && (
                            <circle cx={n.width - 8} cy={8} r={7} fill="#EF4444" />
                          )}
                          {n.status === 'blocked' && (
                            <text x={n.width - 8} y={12} textAnchor="middle" fill="#fff" fontSize="9" fontWeight="bold">!</text>
                          )}
                        </>
                      )}
                    </g>
                  );
                })}
              </svg>
            </div>

            {/* Step detail panel */}
            {selectedStep && (
              <div className="flex-1 overflow-y-auto">
                <div className="p-4 max-w-lg mx-auto">
                  <div className="rounded-lg border border-gray-200 overflow-hidden">
                    {/* Step header */}
                    <div className="flex items-start justify-between px-4 py-3 border-b border-gray-100">
                      <div>
                        <p className="text-sm font-semibold text-gray-900">{selectedStep.label}</p>
                        {selectedStep.assignee && (
                          <p className="text-xs text-gray-500 mt-0.5">Asignado a: {selectedStep.assignee}</p>
                        )}
                      </div>
                      <span
                        className="px-2.5 py-1 rounded-md text-[11px] font-medium uppercase tracking-wider"
                        style={{ backgroundColor: stColor.bg, color: stColor.text, border: `1px solid ${stColor.border}` }}
                      >
                        {statusLabel(selectedStep.status as NodeStatus)}
                      </span>
                    </div>

                    {/* Step details */}
                    <div className="p-4 flex flex-col gap-3">
                      <div className="flex justify-between items-center pb-2 border-b border-gray-100">
                        <span className="text-xs text-gray-500">Actualizado</span>
                        <span className="text-sm font-medium text-gray-900">
                          {selectedStep.ts ? new Date(selectedStep.ts).toLocaleString('es-CL') : '—'}
                        </span>
                      </div>

                      {selectedStep.detail?.missing && (
                        <div className="flex justify-between items-center pb-2 border-b border-gray-100">
                          <span className="text-xs text-gray-500">Missing</span>
                          <span className="text-sm font-semibold text-red-500">{selectedStep.detail.missing}</span>
                        </div>
                      )}

                      {selectedStep.detail?.cost != null && (
                        <div className="flex justify-between items-center pb-2 border-b border-gray-100">
                          <span className="text-xs text-gray-500">Cost</span>
                          <span className="text-sm font-medium text-gray-900">{formatCurrency(selectedStep.detail.cost)}</span>
                        </div>
                      )}

                      {selectedStep.detail?.supplier && (
                        <div className="flex justify-between items-center pb-2 border-b border-gray-100">
                          <span className="text-xs text-gray-500">Supplier</span>
                          <span className="text-sm font-medium text-gray-900">{selectedStep.detail.supplier}</span>
                        </div>
                      )}
                    </div>

                    {/* Actions */}
                    {(() => {
                      const actionDef = ACTION_FOR_STATUS[selectedStep.id];
                      if (!actionDef) return null;
                      const isActive = selectedStep.status === 'active' || selectedStep.status === 'blocked';
                      if (!isActive) return null;
                      return (
                        <div className="px-4 pb-4">
                          {error && (
                            <p className="mb-2 text-xs text-red-600 font-medium">{error}</p>
                          )}
                          <button
                            disabled={advancing}
                            onClick={() => advance(actionDef.action)}
                            className={`w-full rounded-md py-2 text-xs font-semibold transition-colors disabled:opacity-50 ${
                              actionDef.variant === 'danger'
                                ? 'bg-amber-500 text-white hover:bg-amber-600'
                                : 'bg-indigo-600 text-white hover:bg-indigo-700'
                            }`}
                          >
                            {advancing ? 'Procesando…' : actionDef.label}
                          </button>
                        </div>
                      );
                    })()}
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
