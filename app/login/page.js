'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../../lib/supabaseClient';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [mode, setMode] = useState('signin'); // 'signin' | 'signup'
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [busy, setBusy] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setNotice('');
    setBusy(true);

    if (mode === 'signin') {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      setBusy(false);
      if (error) return setError(error.message);
      router.replace('/home');
    } else {
      const { error } = await supabase.auth.signUp({ email, password });
      setBusy(false);
      if (error) return setError(error.message);
      setNotice('Check your email to confirm your account, then log in.');
      setMode('signin');
    }
  }

  return (
    <div className="container">
      <div className="logo-panel">
        <img src="/logo.png" alt="EcoMart" className="logo" />
        <p className="tagline">Give packaging a second life — reduce, reuse, recycle.</p>
      </div>

      <div className="login-panel">
        <form className="login-form" onSubmit={handleSubmit}>
          <h2>{mode === 'signin' ? 'Welcome back' : 'Create your account'}</h2>
          <p className="subhead">
            {mode === 'signin'
              ? 'Log in to keep reusing, reducing, and rising.'
              : 'Sign up to start placing orders.'}
          </p>

          {error && <div className="form-error">{error}</div>}
          {notice && <div className="form-error" style={{ background: '#E8F7EF', color: '#197A56', borderColor: '#9FE3C0' }}>{notice}</div>}

          <input
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Enter password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
            minLength={6}
          />

          {mode === 'signin' && <a href="#" className="forgot">Forgot password?</a>}

          <button type="submit" className="btn" disabled={busy}>
            {busy ? 'Please wait…' : mode === 'signin' ? 'Log in' : 'Sign up'}
          </button>

          <p className="signup">
            {mode === 'signin' ? (
              <>Don't have an account?{' '}
                <a href="#" onClick={e => { e.preventDefault(); setMode('signup'); setError(''); }}>
                  Sign up
                </a>
              </>
            ) : (
              <>Already have an account?{' '}
                <a href="#" onClick={e => { e.preventDefault(); setMode('signin'); setError(''); }}>
                  Log in
                </a>
              </>
            )}
          </p>
        </form>
      </div>
    </div>
  );
}
