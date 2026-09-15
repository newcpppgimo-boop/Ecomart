import { createClient } from '@supabase/supabase-js';

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

/**
 * A client scoped to the calling user's JWT, so Postgres Row Level
 * Security policies (auth.uid() = user_id) apply correctly.
 * Use this for anything a normal user should only touch their own rows of:
 * cart, orders, order_items.
 */
export function getUserSupabase(accessToken) {
  return createClient(url, anonKey, {
    global: { headers: { Authorization: `Bearer ${accessToken}` } }
  });
}

/**
 * Full-privilege client that bypasses RLS entirely.
 * Only use server-side, only for admin actions (e.g. writing products).
 * Never send SUPABASE_SERVICE_ROLE_KEY to the browser.
 */
export function getAdminSupabase() {
  if (!serviceRoleKey) {
    throw new Error('SUPABASE_SERVICE_ROLE_KEY is not set on the server.');
  }
  return createClient(url, serviceRoleKey);
}

/** Pulls the bearer token out of a Next.js Request and returns the user. */
export async function requireUser(request) {
  const authHeader = request.headers.get('authorization') || '';
  const token = authHeader.replace('Bearer ', '');
  if (!token) return { user: null, token: null };

  const client = getUserSupabase(token);
  const { data, error } = await client.auth.getUser();
  if (error || !data?.user) return { user: null, token: null };
  return { user: data.user, token };
}
