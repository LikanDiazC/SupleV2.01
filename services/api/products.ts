import { type Product, type CreateProductPayload } from '@/types';
import { API_BASE } from '@/lib/utils';
import { apiFetch } from '@/lib/apiFetch';

export async function fetchProducts(): Promise<Product[]> {
  const res = await apiFetch(`${API_BASE}/products`);
  if (!res.ok) return [];
  const data = await res.json();
  if (!Array.isArray(data)) return [];
  return data.map((p: any) => ({
    id:          p.id,
    tenantId:    p.tenantId,
    name:        p.name,
    sku:         p.sku,
    description: p.description,
    salePrice:   p.salePrice,
    price:       p.salePrice,
    stock:       p.stock,
  }));
}

export async function createProduct(payload: CreateProductPayload): Promise<Product> {
  const res = await apiFetch(`${API_BASE}/products`, {
    method: 'POST',
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data?.message ?? `Error ${res.status}`);
  }
  return res.json();
}
