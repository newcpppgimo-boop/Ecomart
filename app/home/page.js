'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '../../lib/useUser';
import Sidebar from '../../components/Sidebar';

export default function HomePage() {
  const { user, loading } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) router.replace('/login');
  }, [loading, user, router]);

  if (loading || !user) return <div className="loading-state">Loading…</div>;

  return (
    <div className="container">
      <Sidebar />
      <main className="content">
        <h1>EcoMart</h1>
        <div className="hero">
          <img src="/logo.png" alt="EcoMart logo" />
          <div className="about">
            <h2>About us</h2>
            <p>
              EcoMart is not just an online shop — it's a platform built with a clear purpose.
              We created it to help reduce the amount of packaging waste that often ends up
              being thrown away without being used again. Through EcoMart, we want to promote
              the habit of reduce, reuse, and recycle by making sure that packaging materials
              such as boxes, wrappers, and containers are not wasted but are given a second life.
            </p>
            <ul>
              <li>Affordable</li>
              <li>Sustainable</li>
              <li>Innovative</li>
              <li>Educational</li>
            </ul>
            <strong>Built to reduce, reuse, recycle — and rise.</strong>
          </div>
        </div>
      </main>
    </div>
  );
}
