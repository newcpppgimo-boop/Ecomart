import { createClient } from '@supabase/supabase-js';

// Uses the public anon key — safe for the browser.
// Row Level Security (see supabase/schema.sql) is what actually keeps
// one user's cart/orders private from another's, not this key.
export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);
