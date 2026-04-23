'use client';

import { useState } from 'react';
import { Loader2, AlertCircle } from 'lucide-react';
import SlideOver from '@/components/ui/SlideOver';
import FormField, { inputCls, selectCls } from '@/components/ui/FormField';
import { type CreateInventoryItemPayload, type ItemType } from '@/types';
import { createInventoryItem } from '@/services/api/inventory';

const UNITS = ['UN', 'KG', 'MT', 'M2', 'LT', 'GR', 'CM', 'PZ'];

interface Props {
  open: boolean;
  onClose: () => void;
  onCreated: () => void;
}

function emptyForm(): CreateInventoryItemPayload {
  return { name: '', sku: '', type: 'MATERIAL', unitOfMeasure: 'UN', unitCost: undefined, stock: 0 };
}

export default function CreateItemSlideOver({ open, onClose, onCreated }: Props) {
  const [form, setForm]         = useState<CreateInventoryItemPayload>(emptyForm);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError]       = useState<string | null>(null);

  function set<K extends keyof CreateInventoryItemPayload>(key: K, value: CreateInventoryItemPayload[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function handleClose() {
    setForm(emptyForm());
    setError(null);
    onClose();
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!form.name.trim()) return setError('El nombre es requerido.');

    setSubmitting(true);
    try {
      await createInventoryItem({
        ...form,
        name: form.name.trim(),
        sku: form.sku?.trim() || undefined,
        unitCost: form.unitCost ? Number(form.unitCost) : undefined,
        stock: Number(form.stock ?? 0),
      });
      setForm(emptyForm());
      onCreated();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al crear el ítem.');
    } finally {
      setSubmitting(false);
    }
  }

  const footer = (
    <div className="flex items-center justify-end gap-3">
      <button
        type="button"
        onClick={handleClose}
        disabled={submitting}
        className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-50 disabled:opacity-50"
      >
        Cancelar
      </button>
      <button
        form="create-item-form"
        type="submit"
        disabled={submitting}
        className="flex items-center gap-2 rounded-lg bg-brand-500 px-5 py-2 text-sm font-semibold text-white transition hover:bg-brand-600 disabled:opacity-60"
      >
        {submitting && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
        {submitting ? 'Guardando...' : 'Crear ítem'}
      </button>
    </div>
  );

  return (
    <SlideOver
      open={open}
      onClose={handleClose}
      title="Nuevo Ítem de Inventario"
      subtitle="Agrega un material o producto al inventario."
      footer={footer}
    >
      <form id="create-item-form" onSubmit={handleSubmit} className="space-y-5">
        {error && (
          <div className="flex items-start gap-2 rounded-lg border border-red-100 bg-red-50 px-3 py-2.5 text-sm text-red-700">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
            <p>{error}</p>
          </div>
        )}

        {/* Nombre */}
        <FormField label="Nombre" required>
          <input
            type="text"
            value={form.name}
            onChange={(e) => set('name', e.target.value)}
            placeholder="Ej. Tablero MDF 18mm"
            className={inputCls}
          />
        </FormField>

        {/* SKU + Tipo */}
        <div className="grid grid-cols-2 gap-4">
          <FormField label="SKU">
            <input
              type="text"
              value={form.sku ?? ''}
              onChange={(e) => set('sku', e.target.value)}
              placeholder="Ej. MDF-18-122"
              className={inputCls}
            />
          </FormField>
          <FormField label="Tipo" required>
            <select
              value={form.type}
              onChange={(e) => set('type', e.target.value as ItemType)}
              className={selectCls}
            >
              <option value="MATERIAL">Material</option>
              <option value="PRODUCT">Producto</option>
            </select>
          </FormField>
        </div>

        {/* Unidad + Costo */}
        <div className="grid grid-cols-2 gap-4">
          <FormField label="Unidad de medida">
            <select
              value={form.unitOfMeasure ?? 'UN'}
              onChange={(e) => set('unitOfMeasure', e.target.value)}
              className={selectCls}
            >
              {UNITS.map((u) => (
                <option key={u} value={u}>{u}</option>
              ))}
            </select>
          </FormField>
          <FormField label="Costo unitario (USD)">
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-slate-400">$</span>
              <input
                type="number"
                min="0"
                step="0.01"
                value={form.unitCost ?? ''}
                onChange={(e) => set('unitCost', e.target.value ? Number(e.target.value) : undefined)}
                placeholder="0.00"
                className={`${inputCls} pl-7`}
              />
            </div>
          </FormField>
        </div>

        {/* Stock inicial */}
        <FormField label="Stock inicial" hint="Cantidad disponible al momento de crear el ítem.">
          <input
            type="number"
            min="0"
            step="1"
            value={form.stock ?? 0}
            onChange={(e) => set('stock', Number(e.target.value))}
            className={inputCls}
          />
        </FormField>
      </form>
    </SlideOver>
  );
}
