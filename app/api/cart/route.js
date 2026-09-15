import { NextResponse } from 'next/server';
import { getUserSupabase, requireUser } from '../../../lib/supabaseServer';

// GET /api/cart — the calling user's cart, joined with product info.
export async function GET(request) {
  const { user, token } = await requireUser(request);
  if (!user) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });

  const db = getUserSupabase(token);
  const { data, error } = await db
    .from('cart_items')
    .select('id, quantity, product_id, products ( id, name, price, image_url )')
    .eq('user_id', user.id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ cart: data });
}

// POST /api/cart — add one unit of a product (or increment if already present).
export async function POST(request) {
  const { user, token } = await requireUser(request);
  if (!user) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });

  const { product_id } = await request.json();
  if (!product_id) return NextResponse.json({ error: 'product_id is required' }, { status: 400 });

  const db = getUserSupabase(token);

  const { data: existing } = await db
    .from('cart_items')
    .select('id, quantity')
    .eq('user_id', user.id)
    .eq('product_id', product_id)
    .maybeSingle();

  if (existing) {
    const { data, error } = await db
      .from('cart_items')
      .update({ quantity: existing.quantity + 1 })
      .eq('id', existing.id)
      .select()
      .single();
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ item: data });
  }

  const { data, error } = await db
    .from('cart_items')
    .insert({ user_id: user.id, product_id, quantity: 1 })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ item: data }, { status: 201 });
}

// PATCH /api/cart — set an exact quantity; deletes the row if quantity <= 0.
export async function PATCH(request) {
  const { user, token } = await requireUser(request);
  if (!user) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });

  const { id, quantity } = await request.json();
  if (!id || typeof quantity !== 'number') {
    return NextResponse.json({ error: 'id and numeric quantity are required' }, { status: 400 });
  }

  const db = getUserSupabase(token);

  if (quantity <= 0) {
    const { error } = await db.from('cart_items').delete().eq('id', id).eq('user_id', user.id);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ deleted: true });
  }

  const { data, error } = await db
    .from('cart_items')
    .update({ quantity })
    .eq('id', id)
    .eq('user_id', user.id)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ item: data });
}

// DELETE /api/cart?id=... — remove a line item entirely.
export async function DELETE(request) {
  const { user, token } = await requireUser(request);
  if (!user) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });

  const id = new URL(request.url).searchParams.get('id');
  if (!id) return NextResponse.json({ error: 'id query param is required' }, { status: 400 });

  const db = getUserSupabase(token);
  const { error } = await db.from('cart_items').delete().eq('id', id).eq('user_id', user.id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ deleted: true });
}
