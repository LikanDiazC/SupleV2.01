'use client';

import { useState } from 'react';
import { Plus, Trash2, ShoppingCart, Loader2, AlertCircle } from 'lucide-react';
import Modal from '@/components/ui/Modal';
import { type DealItem, type CreateDealPayload, type Bom } from '@/types';
import { createDeal } from '@/services/api/deals';
import { useFormOptions } from '@/hooks/useFormOptions';

// ── Sub-components ───────────────────────────────────────────────────────────

function SectionTitle({ label }: { label: string }) {
  return (
    <p className="mb-3 text-[10px] font-semibold uppercase tracking-widest text-slate-400">
      {label}
    </p>
  );
}

function FormField({
  label,
  required,
  children,
  hint,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
  hint?: string;
}) {
  return (
    <div>
      <label className="mb-1 block text-xs font-medium text-slate-700">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      {children}
      {hint && <p className="mt-1 text-[10px] text-slate-400">{hint}</p>}
    </div>
  );
}

function ItemRow({
  item,
  index,
  boms,
  onUpdate,
  onRemove,
}: {
  item: DealItem;
  index: number;
  boms: Bom[];
  onUpdate: (index: number, field: keyof DealItem, value: string | number) => void;
  onRemove: (index: number) => void;
}) {
  return (
    <div className="grid grid-cols-[1fr_100px_32px] items-center gap-2">
      <select
        value={item.bomId}
        onChange={(e) => onUpdate(index, 'bomId', e.target.value)}
        className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 outline-none transition focus:border-brand-400 focus:ring-2 focus:ring-brand-100"
      >
        <option value="">— Seleccionar receta —</option>
        {boms.map((b) => (
          <option key={b.id} value={b.id}>{b.name}</option>
        ))}
      </select>
      <input
        type="number"
        min="1"
        value={item.quantity}
        onChange={(e) => onUpdate(index, 'quantity', e.target.value)}
        className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 outline-none transition focus:border-brand-400 focus:ring-2 focus:ring-brand-100"
      />
      <button
        type="button"
        onClick={() => onRemove(index)}
        className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition hover:bg-red-50 hover:text-red-500"
      >
        <Trash2 className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}

// ── Main component ───────────────────────────────────────────────────────────

interface Props {
  open: boolean;
  onClose: () => void;
  onCreated: () => void;
}

function emptyItem(): DealItem {
  return { bomId: '', quantity: 1 };
}

export default function CreateDealModal({ open, onClose, onCreated }: Props) {
  const { contacts, companies, boms } = useFormOptions(open);

  const [name, setName]         = useState('');
  const [amount, setAmount]     = useState('');
  const [contactId, setContactId] = useState('');
  const [companyId, setCompanyId] = useState('');
  const [items, setItems]       = useState<DealItem[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError]       = useState<string | null>(null);

  function reset() {
    setName(''); setAmount(''); setContactId(''); setCompanyId('');
    setItems([]); setError(null);
  }

  function handleClose() { reset(); onClose(); }

  function addItem() { setItems((prev) => [...prev, emptyItem()]); }

  function updateItem(index: number, field: keyof DealItem, value: string | number) {
    setItems((prev) =>
      prev.map((item, i) =>
        i === index
          ? { ...item, [field]: field === 'quantity' ? Number(value) : value }
          : item
      )
    );
  }

  function removeItem(index: number) {
    setItems((prev) => prev.filter((_, i) => i !== index));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!name.trim()) return setError('El nombre del negocio es requerido.');
    if (!amount || isNaN(Number(amount))) return setError('Ingresa un monto válido.');

    const validItems = items.filter((i) => i.bomId && i.quantity > 0);

    const payload: CreateDealPayload = {
      name: name.trim(),
      amount: Number(amount),
      stage: 'NUEVO',
      ...(contactId && { contactId }),
      ...(companyId && { companyId }),
      ...(validItems.length > 0 && { items: validItems }),
    };

    setSubmitting(true);
    try {
      await createDeal(payload);
      reset();
      onCreated();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al crear el negocio.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Modal
      open={open}
      onClose={handleClose}
      title="Nuevo Negocio"
      subtitle="Completa los datos para crear el negocio en el pipeline."
      size="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Error banner */}
        {error && (
          <div className="flex items-start gap-2 rounded-lg border border-red-100 bg-red-50 px-3 py-2.5 text-sm text-red-700">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
            <p>{error}</p>
          </div>
        )}

        {/* ── Información básica ── */}
        <div>
          <SectionTitle label="Información básica" />
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <FormField label="Nombre del negocio" required>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ej. Mueble TV — Casa López"
                  className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 placeholder-slate-400 outline-none transition focus:border-brand-400 focus:ring-2 focus:ring-brand-100"
                />
              </FormField>
            </div>
            <FormField label="Monto total (USD)" required>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-slate-400">$</span>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0"
                  className="w-full rounded-lg border border-slate-200 bg-white py-2 pl-7 pr-3 text-sm text-slate-800 placeholder-slate-400 outline-none transition focus:border-brand-400 focus:ring-2 focus:ring-brand-100"
                />
              </div>
            </FormField>
            <FormField label="Etapa inicial">
              <div className="flex items-center rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-500">
                <span className="mr-2 h-2 w-2 rounded-full bg-slate-400" />
                NUEVO
              </div>
            </FormField>
          </div>
        </div>

        {/* ── Cliente & Empresa ── */}
        <div>
          <SectionTitle label="Cliente & empresa" />
          <div className="grid grid-cols-2 gap-4">
            <FormField
              label="Contacto"
              hint={contacts.length === 0 ? 'Sin contactos en la API aún.' : undefined}
            >
              <select
                value={contactId}
                onChange={(e) => setContactId(e.target.value)}
                className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 outline-none transition focus:border-brand-400 focus:ring-2 focus:ring-brand-100"
              >
                <option value="">— Sin contacto —</option>
                {contacts.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </FormField>
            <FormField
              label="Empresa"
              hint={companies.length === 0 ? 'Sin empresas en la API aún.' : undefined}
            >
              <select
                value={companyId}
                onChange={(e) => setCompanyId(e.target.value)}
                className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 outline-none transition focus:border-brand-400 focus:ring-2 focus:ring-brand-100"
              >
                <option value="">— Sin empresa —</option>
                {companies.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </FormField>
          </div>
        </div>

        {/* ── Productos (Carrito) ── */}
        <div>
          <div className="mb-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShoppingCart className="h-3.5 w-3.5 text-slate-400" />
              <SectionTitle label={`Productos${items.length > 0 ? ` (${items.length})` : ''}`} />
            </div>
            <button
              type="button"
              onClick={addItem}
              className="flex items-center gap-1 rounded-lg border border-dashed border-brand-300 px-2.5 py-1 text-[11px] font-medium text-brand-600 transition hover:border-brand-400 hover:bg-brand-50"
            >
              <Plus className="h-3 w-3" />
              Agregar producto
            </button>
          </div>

          {items.length === 0 ? (
            <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 py-8 text-center">
              <ShoppingCart className="mx-auto mb-2 h-5 w-5 text-slate-300" />
              <p className="text-xs text-slate-400">Sin productos agregados.</p>
              <p className="mt-0.5 text-[10px] text-slate-300">
                Las recetas seleccionadas gatillan órdenes de producción al ganar la venta.
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              <div className="grid grid-cols-[1fr_100px_32px] gap-2 px-1">
                <span className="text-[10px] font-medium uppercase tracking-wider text-slate-400">Producto</span>
                <span className="text-[10px] font-medium uppercase tracking-wider text-slate-400">Cantidad</span>
                <span />
              </div>
              {items.map((item, index) => (
                <ItemRow
                  key={index}
                  item={item}
                  index={index}
                  boms={boms}
                  onUpdate={updateItem}
                  onRemove={removeItem}
                />
              ))}
              {boms.length === 0 && (
                <p className="rounded-lg bg-amber-50 px-3 py-2 text-[11px] text-amber-700">
                  Sin recetas (BOMs) creadas aún — crea una receta en Producción primero.
                </p>
              )}
            </div>
          )}
        </div>

        {/* ── Footer actions ── */}
        <div className="flex items-center justify-end gap-3 border-t border-slate-100 pt-4">
          <button
            type="button"
            onClick={handleClose}
            disabled={submitting}
            className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-600 transition hover:border-slate-300 hover:bg-slate-50 disabled:opacity-50"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="flex items-center gap-2 rounded-lg bg-brand-500 px-5 py-2 text-sm font-semibold text-white transition hover:bg-brand-600 disabled:opacity-60"
          >
            {submitting && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
            {submitting ? 'Creando...' : 'Crear negocio'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
