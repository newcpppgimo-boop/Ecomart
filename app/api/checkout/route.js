import { NextResponse } from 'next/server';
import { getUserSupabase, getAdminSupabase, requireUser } from '../../../lib/supabaseServer';

// POST /api/checkout — reads the user's cart, creates an order + order_items,
// then empties the cart. Uses the admin client for the order_items insert
// since that table has no insert policy for regular users (see schema.sql).
export async function POST(request) {
  const { user, token } = await requireUser(request);
  if (!user) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });

  const userDb = getUserSupabase(token);

  const { data: cartItems, error: cartError } = await userDb
    .from('cart_items')
    .select('id, quantity, product_id, products ( id, name, price )')
    .eq('user_id', user.id);

  if (cartError) return NextResponse.json({ error: cartError.message }, { status: 500 });
  if (!cartItems || cartItems.length === 0) {
    return NextResponse.json({ error: 'Cart is empty' }, { status: 400 });
  }

  const total = cartItems.reduce((sum, item) => sum + item.quantity * item.products.price, 0);

  // Order row is owned by the user, so this can go through the user-scoped client.
  const { data: order, error: orderError } = await userDb
    .from('orders')
    .insert({ user_id: user.id, total })
    .select()
    .single();

  if (orderError) return NextResponse.json({ error: orderError.message }, { status: 500 });

  const adminDb = getAdminSupabase();
  const orderItems = cartItems.map(item => ({
    order_id: order.id,
    product_id: item.product_id,
    name: item.products.name,
    price: item.products.price,
    quantity: item.quantity
  }));

  const { error: itemsError } = await adminDb.from('order_items').insert(orderItems);
  if (itemsError) return NextResponse.json({ error: itemsError.message }, { status: 500 });

  await userDb.from('cart_items').delete().eq('user_id', user.id);

  return NextResponse.json({ order }, { status: 201 });
}
