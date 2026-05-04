'use client';

import { CheckCircle, XCircle, Loader2 } from 'lucide-react';

export type StoreCheckoutStatus = 'idle' | 'loading' | 'success' | 'error' | 'skipped';

export interface CheckoutResults {
  easy: StoreCheckoutStatus;
  sodimac: StoreCheckoutStatus;
  easyError?: string;
  sodimacError?: string;
  hasEasyItems: boolean;
  hasSodimacItems: boolean;
}

interface CheckoutConfirmModalProps {
  open: boolean;
  results: CheckoutResults;
  onConfirmAll: () => void;
  onConfirmEasy: () => void;
  onConfirmSodimac: () => void;
  onClose: () => void;
}

function StatusIcon({ status }: { status: StoreCheckoutStatus }) {
  if (status === 'loading') return <Loader2 className="h-4 w-4 animate-spin text-slate-400" />;
  if (status === 'success') return <CheckCircle className="h-4 w-4 text-green-500" />;
  if (status === 'error')   return <XCircle className="h-4 w-4 text-red-500" />;
  if (status === 'skipped') return <XCircle className="h-4 w-4 text-slate-300" />;
  return null;
}

function statusLabel(status: StoreCheckoutStatus, error?: string): string {
  if (status === 'loading') return 'Preparando...';
  if (status === 'success') return 'Carrito listo';
  if (status === 'error')   return error ?? 'Error al preparar el carrito';
  if (status === 'skipped') return 'Sin items';
  return '';
}

export default function CheckoutConfirmModal({
  open, results, onConfirmAll, onConfirmEasy, onConfirmSodimac, onClose,
}: CheckoutConfirmModalProps) {
  if (!open) return null;

  const easyOk      = results.easy === 'success';
  const sodimacOk   = results.sodimac === 'success';
  const isLoading   = results.easy === 'loading' || results.sodimac === 'loading';

  const canConfirmAll     = !isLoading && easyOk && sodimacOk;
  const canConfirmEasy    = !isLoading && easyOk && !sodimacOk && results.hasSodimacItems;
  const canConfirmSodimac = !isLoading && sodimacOk && !easyOk && results.hasEasyItems;

  return (
    <>
      <div className="fixed inset-0 z-50 bg-black/30" />
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="w-full max-w-sm rounded-2xl bg-white shadow-2xl p-6 space-y-5">
          <h2 className="text-base font-semibold text-slate-900">¿Completaste tu compra?</h2>

          <div className="space-y-3">
            {results.hasEasyItems && (
              <div className="flex items-center gap-3 rounded-xl border border-slate-100 bg-slate-50 px-4 py-3">
                <StatusIcon status={results.easy} />
                <div>
                  <p className="text-sm font-medium text-slate-800">Easy</p>
                  <p className="text-xs text-slate-500">{statusLabel(results.easy, results.easyError)}</p>
                </div>
              </div>
            )}
            {results.hasSodimacItems && (
              <div className="flex items-center gap-3 rounded-xl border border-slate-100 bg-slate-50 px-4 py-3">
                <StatusIcon status={results.sodimac} />
                <div>
                  <p className="text-sm font-medium text-slate-800">Sodimac</p>
                  <p className="text-xs text-slate-500">{statusLabel(results.sodimac, results.sodimacError)}</p>
                </div>
              </div>
            )}
          </div>

          {!isLoading && (
            <div className="flex flex-col gap-2">
              {canConfirmAll && (
                <button
                  onClick={onConfirmAll}
                  className="w-full rounded-lg bg-brand-500 py-2.5 text-sm font-semibold text-white hover:bg-brand-600 transition"
                >
                  Sí, vaciar carrito
                </button>
              )}
              {canConfirmEasy && (
                <button
                  onClick={onConfirmEasy}
                  className="w-full rounded-lg bg-brand-500 py-2.5 text-sm font-semibold text-white hover:bg-brand-600 transition"
                >
                  Vaciar solo Easy
                </button>
              )}
              {canConfirmSodimac && (
                <button
                  onClick={onConfirmSodimac}
                  className="w-full rounded-lg bg-brand-500 py-2.5 text-sm font-semibold text-white hover:bg-brand-600 transition"
                >
                  Vaciar solo Sodimac
                </button>
              )}
              <button
                onClick={onClose}
                className="w-full rounded-lg border border-slate-200 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-50 transition"
              >
                Cerrar (mantener carrito)
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
