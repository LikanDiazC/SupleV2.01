import { NextRequest, NextResponse } from 'next/server';

const VTEX_BASE = 'https://easycl.vteximg.com.br/api/checkout/pub';

export async function POST(req: NextRequest) {
  try {
    const { items } = await req.json() as { items: { sku: string; quantity: number }[] };

    const formRes = await fetch(`${VTEX_BASE}/orderForm`, {
      headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
    });
    if (!formRes.ok) {
      const text = await formRes.text().catch(() => '');
      return NextResponse.json(
        { error: `VTEX orderForm ${formRes.status}: ${text.slice(0, 200)}` },
        { status: 502 },
      );
    }
    const { orderFormId } = await formRes.json() as { orderFormId: string };

    const orderItems = items.map(item => ({ id: item.sku, quantity: item.quantity, seller: '1' }));

    const addRes = await fetch(`${VTEX_BASE}/orderForm/${orderFormId}/items`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({ orderItems }),
    });
    if (!addRes.ok) {
      const text = await addRes.text().catch(() => '');
      return NextResponse.json(
        { error: `VTEX addItems ${addRes.status}: ${text.slice(0, 200)}` },
        { status: 502 },
      );
    }

    return NextResponse.json({
      cartUrl: `https://www.easy.cl/checkout?orderFormId=${orderFormId}#/cart`,
    });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : 'Error desconocido';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
