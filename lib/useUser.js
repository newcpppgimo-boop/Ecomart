'use client';

import { useEffect, useState } from 'react';
import { supabase } from './supabaseClient';

/**
 * Returns { user, session, loading }.
 * `loading` is true until the initial session check resolves —
 * pages should wait for it before deciding to redirect to /login,
 * otherwise a logged-in user gets bounced on every refresh.
 */
export function useUser() {
  const [state, setState] = useState({ user: null, session: null, loading: true });

  useEffect(() => {
    let mounted = true;

    supabase.auth.getSession().then(({ data }) => {
      if (!mounted) return;
      setState({ user: data.session?.user ?? null, session: data.session, loading: false });
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setState({ user: session?.user ?? null, session, loading: false });
    });

    return () => {
      mounted = false;
      listener.subscription.unsubscribe();
    };
  }, []);

  return state;
}
