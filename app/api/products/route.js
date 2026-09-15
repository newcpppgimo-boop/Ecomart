import { NextResponse } from 'next/server';
import { getAdminSupabase, requireUser } from '../../../lib/supabaseServer';

// GET /api/products — public catalog, anyone can read.
export async function GET() {
  const db = getAdminSupabase();
  const { data, error } = await db
    .from('products')
    .select('id, name, price, image_url')
    .order('created_at', { ascending: true });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ products: data });
}

// POST /api/products — add a product.
// NOTE: this demo only checks that the caller is a logged-in user.
// Before shipping, gate this behind a real admin check, e.g. a
// `role` claim in the user's JWT or an `is_admin` column you look up.
export async function POST(request) {
  const { user } = await requireUser(request);
  if (!user) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });

  const body = await request.json();
  const { name, price, image_url } = body;

  if (!name || typeof price !== 'number') {
    return NextResponse.json({ error: 'name and numeric price are required' }, { status: 400 });
  }

  const db = getAdminSupabase();
  const { data, error } = await db
    .from('products')
    .insert({ name, price, image_url: image_url || null })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ product: data }, { status: 201 });
}
