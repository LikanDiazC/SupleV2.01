'use client';

import { useEffect, useState } from 'react';
import { Plus, Trash2, Loader2, AlertCircle, Layers } from 'lucide-react';
import SlideOver from '@/components/ui/SlideOver';
import FormField, { inputCls, selectCls } from '@/components/ui/FormField';
import { type BomComponent, type CreateBomPayload, type InventoryItem } from '@/types';
import { createBom } from '@/services/api/boms';
import { fetchInventory } from '@/services/api/inventory';

interface Props {
  open: boolean;
  onClose: () => void;
  onCreated: () => void;
}

function emptyComponent(): BomComponent {
  return { materialId: '', quantity: 1 };
}

export default function CreateBomSlideOver({ open, onClose, onCreated }: Props) {
  const [name, setName]             = useState('');
  const [productId, setProductId]   = useState('');
  const [components, setComponents] = useState<BomComponent[]>([emptyComponent()]);
  const [materials, setMaterials]   = useState<InventoryItem[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError]           = useState<string | null>(null);

  // Load materials when slide-over opens
  useEffect(() => {
    if (!open) return;
    fetchInventory()
      .then((all) => setMaterials(all.filter((i) => i.type === 'MATERIAL')))
      .catch(() => setMaterials([]));
  }, [open]);

  function reset() {
    setName(''); setProductId('');
    setComponents([emptyComponent()]); setError(null);
  }

  function handleClose() { reset(); onClose(); }

  function addComponent() {
    setComponents((prev) => [...prev, emptyComponent()]);
  }

  function updateComponent(index: number, field: keyof BomComponent, value: string | number) {
    setComponents((prev) =>
      prev.map((c, i) =>
        i === index
          ? { ...c, [field]: field === 'quantity' ? Number(value) : value }
          : c
      )
    );
  }

  function removeComponent(index: number) {
    setComponents((prev) => prev.filter((_, i) => i !== index));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!name.trim()) return setError('El nombre de la receta es requerido.');
    const validComponents = components.filter((c) => c.materialId && c.quantity > 0);
    if (validComponents.length === 0)
      return setError('Agrega al menos un componente válido.');

    const payload: CreateBomPayload = {
      name: name.trim(),
      ...(productId && { productId }),
      components: validComponents,
    };

    setSubmitting(true);
    try {
      await createBom(payload);
      reset();
      onCreated();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al crear la receta.');
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
        form="create-bom-form"
        type="submit"
        disabled={submitting}
        className="flex items-center gap-2 rounded-lg bg-brand-500 px-5 py-2 text-sm font-semibold text-white transition hover:bg-brand-600 disabled:opacity-60"
      >
        {submitting && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
        {submitting ? 'Guardando...' : 'Crear receta'}
      </button>
    </div>
  );

  return (
    <SlideOver
      open={open}
      onClose={handleClose}
      title="Nueva Receta (BOM)"
      subtitle="Define los componentes necesarios para fabricar un producto."
      width="xl"
      footer={footer}
    >
      <form id="create-bom-form" onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="flex items-start gap-2 rounded-lg border border-red-100 bg-red-50 px-3 py-2.5 text-sm text-red-700">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
            <p>{error}</p>
          </div>
        )}

        {/* Datos básicos */}
        <div>
          <p className="mb-3 text-[10px] font-semibold uppercase tracking-widest text-slate-400">
            Información general
          </p>
          <div className="space-y-4">
            <FormField label="Nombre de la receta" required>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ej. Mueble TV 1.8m — Estándar"
                className={inputCls}
              />
            </FormField>
            <FormField
              label="Producto final (ID)"
              hint="ID del ítem de inventario de tipo Producto que se fabrica con esta receta."
            >
              <input
                type="text"
                value={productId}
                onChange={(e) => setProductId(e.target.value)}
                placeholder="ID del producto final (opcional)"
                className={inputCls}
              />
            </FormField>
          </div>
        </div>

        {/* Componentes dinámicos */}
        <div>
          <div className="mb-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Layers className="h-3.5 w-3.5 text-slate-400" />
              <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400">
                Componentes{components.length > 0 && ` (${components.length})`}
              </p>
            </div>
            <button
              type="button"
              onClick={addComponent}
              className="flex items-center gap-1 rounded-lg border border-dashed border-brand-300 px-2.5 py-1 text-[11px] font-medium text-brand-600 transition hover:border-brand-400 hover:bg-brand-50"
            >
              <Plus className="h-3 w-3" />
              Agregar componente
            </button>
          </div>

          {/* Header row */}
          <div className="mb-2 grid grid-cols-[1fr_100px_32px] gap-2 px-1">
            <span className="text-[10px] font-medium uppercase tracking-wider text-slate-400">Material</span>
            <span className="text-[10px] font-medium uppercase tracking-wider text-slate-400">Cantidad</span>
            <span />
          </div>

          <div className="space-y-2">
            {components.map((comp, index) => (
              <div key={index} className="grid grid-cols-[1fr_100px_32px] items-center gap-2">
                <select
                  value={comp.materialId}
                  onChange={(e) => updateComponent(index, 'materialId', e.target.value)}
                  className={selectCls}
                >
                  <option value="">— Seleccionar material —</option>
                  {materials.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.name}{m.sku ? ` (${m.sku})` : ''}
                    </option>
                  ))}
                </select>
                <input
                  type="number"
                  min="0.01"
                  step="0.01"
                  value={comp.quantity}
                  onChange={(e) => updateComponent(index, 'quantity', e.target.value)}
                  className={inputCls}
                />
                <button
                  type="button"
                  onClick={() => removeComponent(index)}
                  disabled={components.length === 1}
                  className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition hover:bg-red-50 hover:text-red-500 disabled:opacity-30"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            ))}

            {materials.length === 0 && (
              <p className="rounded-lg bg-amber-50 px-3 py-2 text-[11px] text-amber-700">
                No se encontraron materiales en el inventario. Crea algunos antes de armar recetas.
              </p>
            )}
          </div>
        </div>
      </form>
    </SlideOver>
  );
}
