'use client';

import { useState } from 'react';
import { Loader2, AlertCircle } from 'lucide-react';
import SlideOver from '@/components/ui/SlideOver';
import FormField, { inputCls, selectCls } from '@/components/ui/FormField';
import { type CreateMaterialPayload, type MaterialType, type GrainDirection } from '@/types';
import { createInventoryItem } from '@/services/api/inventory';

const UNITS = ['UN', 'KG', 'MT', 'M2', 'LT', 'GR', 'CM', 'PZ', 'plancha'];

interface Props {
  open: boolean;
  onClose: () => void;
  onCreated: () => void;
}

function emptyForm(): CreateMaterialPayload {
  return {
    name: '',
    sku: '',
    materialType: 'SHEET',
    unitOfMeasure: 'plancha',
    unitCost: 0,
    stock: 0,
  };
}

export default function CreateItemSlideOver({ open, onClose, onCreated }: Props) {
  const [form, setForm]             = useState<CreateMaterialPayload>(emptyForm);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError]           = useState<string | null>(null);

  function set<K extends keyof CreateMaterialPayload>(key: K, value: CreateMaterialPayload[K]) {
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
    if (!form.sku.trim())  return setError('El SKU es requerido.');

    setSubmitting(true);
    try {
      await createInventoryItem({ ...form, name: form.name.trim(), sku: form.sku.trim() });
      setForm(emptyForm());
      onCreated();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al crear el material.');
    } finally {
      setSubmitting(false);
    }
  }

  const isSheet = form.materialType === 'SHEET';

  const footer = (
    <div className="flex items-center justify-end gap-3">
      <button type="button" onClick={handleClose} disabled={submitting}
        className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-50 disabled:opacity-50">
        Cancelar
      </button>
      <button form="create-item-form" type="submit" disabled={submitting}
        className="flex items-center gap-2 rounded-lg bg-brand-500 px-5 py-2 text-sm font-semibold text-white transition hover:bg-brand-600 disabled:opacity-60">
        {submitting && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
        {submitting ? 'Guardando...' : 'Crear material'}
      </button>
    </div>
  );

  return (
    <SlideOver open={open} onClose={handleClose} title="Nuevo Material"
      subtitle="Agrega una plancha, herraje o consumible al inventario."
      footer={footer}>
      <form id="create-item-form" onSubmit={handleSubmit} className="space-y-5">
        {error && (
          <div className="flex items-start gap-2 rounded-lg border border-red-100 bg-red-50 px-3 py-2.5 text-sm text-red-700">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
            <p>{error}</p>
          </div>
        )}

        <FormField label="Nombre" required>
          <input type="text" value={form.name}
            onChange={(e) => set('name', e.target.value)}
            placeholder="Ej. MDF 18mm Natural" className={inputCls} />
        </FormField>

        <div className="grid grid-cols-2 gap-4">
          <FormField label="SKU" required>
            <input type="text" value={form.sku}
              onChange={(e) => set('sku', e.target.value)}
              placeholder="Ej. MDF-18-NAT" className={inputCls} />
          </FormField>
          <FormField label="Tipo" required>
            <select value={form.materialType}
              onChange={(e) => set('materialType', e.target.value as MaterialType)}
              className={selectCls}>
              <option value="SHEET">Plancha</option>
              <option value="HARDWARE">Herraje</option>
              <option value="CONSUMABLE">Consumible</option>
            </select>
          </FormField>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <FormField label="Unidad de medida">
            <select value={form.unitOfMeasure}
              onChange={(e) => set('unitOfMeasure', e.target.value)}
              className={selectCls}>
              {UNITS.map((u) => <option key={u} value={u}>{u}</option>)}
            </select>
          </FormField>
          <FormField label="Costo unitario">
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-slate-400">CLP</span>
              <input type="number" min="0" step="0.01" value={form.unitCost}
                onChange={(e) => set('unitCost', Number(e.target.value))}
                placeholder="0" className={`${inputCls} pl-12`} />
            </div>
          </FormField>
        </div>

        <FormField label="Stock inicial">
          <input type="number" min="0" step="1" value={form.stock}
            onChange={(e) => set('stock', e.target.value === '' ? 0 : Number(e.target.value))}
            onFocus={(e) => e.target.select()}
            className={inputCls} />
        </FormField>

        {/* Campos de plancha */}
        {isSheet && (
          <div className="space-y-4 rounded-lg border border-slate-200 p-4">
            <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400">
              Dimensiones de plancha
            </p>
            <div className="grid grid-cols-2 gap-4">
              <FormField label="Ancho (mm)">
                <input type="number" min="1" value={form.sheetWidthMm ?? ''}
                  onChange={(e) => set('sheetWidthMm', e.target.value ? Number(e.target.value) : undefined)}
                  placeholder="1830" className={inputCls} />
              </FormField>
              <FormField label="Alto (mm)">
                <input type="number" min="1" value={form.sheetHeightMm ?? ''}
                  onChange={(e) => set('sheetHeightMm', e.target.value ? Number(e.target.value) : undefined)}
                  placeholder="2440" className={inputCls} />
              </FormField>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <FormField label="Espesor (mm)">
                <input type="number" min="1" value={form.thicknessMm ?? ''}
                  onChange={(e) => set('thicknessMm', e.target.value ? Number(e.target.value) : undefined)}
                  placeholder="18" className={inputCls} />
              </FormField>
              <FormField label="Dirección de veta">
                <select value={form.grainDirection ?? 'NONE'}
                  onChange={(e) => set('grainDirection', e.target.value as GrainDirection)}
                  className={selectCls}>
                  <option value="NONE">Sin veta</option>
                  <option value="VERTICAL">Vertical</option>
                  <option value="HORIZONTAL">Horizontal</option>
                </select>
              </FormField>
            </div>
          </div>
        )}
      </form>
    </SlideOver>
  );
}
