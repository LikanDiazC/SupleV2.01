'use client';

import { CheckCircle, XCircle, Loader2, ExternalLink } from 'lucide-react';

export type StoreCheckoutStatus = 'idle' | 'loading' | 'success' | 'error' | 'skipped';

export interface ProductLink { titulo: string; url: string; }

export interface CheckoutResults {
  easy: StoreCheckoutStatus;
  sodimac: StoreCheckoutStatus;
  easyError?: string;
  sodimacError?: string;
  easyProductLinks?: ProductLink[];
  sodimacProductLinks?: ProductLink[];
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

function ProductLinkList({ links, store }: { links: ProductLink[]; store: string }) {
  if (links.length === 0) {
    return <p className="text-xs text-slate-400 pt-1">No hay URLs disponibles para estos productos.</p>;
  }
  return (
    <div className="space-y-1.5 pt-2">
      <p className="text-[11px] text-slate-400">Haz clic para abrir cada producto en {store}:</p>
      {links.map((link, i) => (
        <a
          key={i}
          href={link.url}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-left transition hover:border-brand-300 hover:bg-brand-50 group"
        >
          <ExternalLink className="h-3.5 w-3.5 shrink-0 text-slate-400 group-hover:text-brand-500 transition" />
          <span className="text-xs font-medium text-slate-700 group-hover:text-brand-700 leading-snug line-clamp-2">
            {link.titulo}
          </span>
        </a>
      ))}
    </div>
  );
}

export default function CheckoutConfirmModal({
  open, results, onConfirmAll, onConfirmEasy, onConfirmSodimac, onClose,
}: CheckoutConfirmModalProps) {
  if (!open) return null;

  const easyOk    = results.easy === 'success';
  const sodimacOk = results.sodimac === 'success';
  const isLoading = results.easy === 'loading' || results.sodimac === 'loading';

  const canConfirmAll     = !isLoading && easyOk && sodimacOk;
  const canConfirmEasy    = !isLoading && easyOk && !sodimacOk && results.hasSodimacItems;
  const canConfirmSodimac = !isLoading && sodimacOk && !easyOk && results.hasEasyItems;

  return (
    <>
      <div className="fixed inset-0 z-50 bg-black/30" />
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="w-full max-w-sm rounded-2xl bg-white shadow-2xl p-6 space-y-4 max-h-[90vh] overflow-y-auto">
          <h2 className="text-base font-semibold text-slate-900">Completa tu compra</h2>

          <div className="space-y-3">
            {results.hasEasyItems && (
              <div className="rounded-xl border border-slate-100 bg-slate-50 px-4 py-3">
                <div className="flex items-center gap-3">
                  <StatusIcon status={results.easy} />
                  <div>
                    <p className="text-sm font-medium text-slate-800">Easy</p>
                    {results.easy === 'loading' && <p className="text-xs text-slate-500">Preparando...</p>}
                    {results.easy === 'error'   && <p className="text-xs text-red-500">{results.easyError ?? 'Error'}</p>}
                    {results.easy === 'skipped' && <p className="text-xs text-slate-400">Sin items</p>}
                  </div>
                </div>
                {easyOk && results.easyProductLinks && (
                  <ProductLinkList links={results.easyProductLinks} store="Easy.cl" />
                )}
              </div>
            )}

            {results.hasSodimacItems && (
              <div className="rounded-xl border border-slate-100 bg-slate-50 px-4 py-3">
                <div className="flex items-center gap-3">
                  <StatusIcon status={results.sodimac} />
                  <div>
                    <p className="text-sm font-medium text-slate-800">Sodimac</p>
                    {results.sodimac === 'loading' && <p className="text-xs text-slate-500">Preparando...</p>}
                    {results.sodimac === 'error'   && <p className="text-xs text-red-500">{results.sodimacError ?? 'Error'}</p>}
                    {results.sodimac === 'skipped' && <p className="text-xs text-slate-400">Sin items</p>}
                  </div>
                </div>
                {sodimacOk && results.sodimacProductLinks && (
                  <ProductLinkList links={results.sodimacProductLinks} store="Sodimac.cl" />
                )}
              </div>
            )}
          </div>

          {!isLoading && (
            <div className="flex flex-col gap-2 pt-1">
              {canConfirmAll && (
                <button
                  onClick={onConfirmAll}
                  className="w-full rounded-lg bg-brand-500 py-2.5 text-sm font-semibold text-white hover:bg-brand-600 transition"
                >
                  Listo, vaciar carrito
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
