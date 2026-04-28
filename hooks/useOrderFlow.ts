'use client';

import { useState, useEffect, useCallback } from 'react';
import { fetchOrders, advanceOrder, type OrderAction } from '@/services/api/orders';

export type StepStatus = 'done' | 'active' | 'blocked' | 'pending';

export interface FlowStep {
  id: string;
  label: string;
  status: StepStatus;
  type?: 'task' | 'gateway';
  assignee?: string;
  ts?: string;
  detail?: {
    missing?: string;
    cost?: number;
    supplier?: string;
  };
}

export interface OrderFlowData {
  id: string;
  name: string;
  client: string;
  assignee?: string;
  dueDate?: string;
  value: number;
  currency: string;
  steps: FlowStep[];
}

const MAIN_ORDER = [
  'ORDER_RECEIVED',
  'CHECKING_STOCK',
  'READY_TO_START',
  'IN_PRODUCTION',
  'MANUFACTURED',
  'SHIPPED',
  'DELIVERED',
] as const;

type MainStatus = typeof MAIN_ORDER[number];

function buildSteps(currentStatus: string): FlowStep[] {
  const isOnHold = currentStatus === 'ON_HOLD_MATERIALS';
  const mainIdx = isOnHold
    ? 1 // after CHECKING_STOCK
    : MAIN_ORDER.indexOf(currentStatus as MainStatus);

  const defs: Array<{ id: string; label: string; type?: 'task' | 'gateway' }> = [
    { id: 'ORDER_RECEIVED',    label: 'Orden recibida' },
    { id: 'CHECKING_STOCK',    label: 'Verificar stock', type: 'gateway' },
    { id: 'ON_HOLD_MATERIALS', label: 'Confirmar compra' },
    { id: 'READY_TO_START',    label: 'Listo para iniciar' },
    { id: 'IN_PRODUCTION',     label: 'Fabricación' },
    { id: 'MANUFACTURED',      label: 'Fabricado' },
    { id: 'SHIPPED',           label: 'En tránsito' },
    { id: 'DELIVERED',         label: 'Entregado' },
  ];

  return defs.map(({ id, label, type }) => {
    let status: StepStatus;

    if (id === 'ON_HOLD_MATERIALS') {
      status = isOnHold ? 'blocked' : 'pending';
    } else {
      const stepIdx = MAIN_ORDER.indexOf(id as MainStatus);
      if (stepIdx < mainIdx) status = 'done';
      else if (stepIdx === mainIdx && !isOnHold) status = 'active';
      else status = 'pending';
    }

    return { id, label, type: type ?? 'task', status };
  });
}

export function useOrderFlow(orderId: string | null) {
  const [data, setData]         = useState<OrderFlowData | null>(null);
  const [loading, setLoading]   = useState(false);
  const [advancing, setAdvancing] = useState(false);
  const [error, setError]       = useState<string | null>(null);
  const [tick, setTick]         = useState(0);

  const refresh = useCallback(() => setTick((t) => t + 1), []);

  useEffect(() => {
    if (!orderId) { setData(null); return; }

    setLoading(true);
    setError(null);

    fetchOrders()
      .then((orders) => {
        const order = orders.find((o) => o.id === orderId);
        if (!order) {
          setError('Orden no encontrada');
          setLoading(false);
          return;
        }
        setData({
          id:       order.id,
          name:     order.productName ?? 'Orden de producción',
          client:   order.clientName  ?? '—',
          value:    0,
          currency: 'CLP',
          steps:    buildSteps(order.status),
        });
        setLoading(false);
      })
      .catch(() => {
        setError('Error al cargar la orden');
        setLoading(false);
      });
  }, [orderId, tick]);

  const advance = useCallback(
    async (action: OrderAction) => {
      if (!orderId) return;
      setAdvancing(true);
      setError(null);
      try {
        await advanceOrder(orderId, action);
        refresh();
      } catch (e: any) {
        setError(e.message ?? 'Error al avanzar la orden');
      } finally {
        setAdvancing(false);
      }
    },
    [orderId, refresh],
  );

  return { data, loading, advancing, error, refresh, advance };
}
