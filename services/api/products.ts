import { type Product, type CreateProductPayload } from '@/types';
import { API_BASE } from '@/lib/utils';
import { getAccessToken } from '@/lib/auth';

function authHeaders() {
  return {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${getAccessToken() ?? ''}`,
  };
}

export async function fetchProducts(): Promise<Product[]> {
  const res = await fetch(`${API_BASE}/products`, { headers: authHeaders() });
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
    price:       p.salePrice,   // alias para UI
    stock:       p.stock,
  }));
}

export async function createProduct(payload: CreateProductPayload): Promise<Product> {
  const res = await fetch(`${API_BASE}/products`, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data?.message ?? `Error ${res.status}`);
  }
  return res.json();
}
