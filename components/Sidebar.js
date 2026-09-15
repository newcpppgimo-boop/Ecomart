'use client';

import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { supabase } from '../lib/supabaseClient';

export default function Sidebar() {
  const router = useRouter();
  const pathname = usePathname();

  async function handleLogout() {
    await supabase.auth.signOut();
    router.replace('/login');
  }

  const links = [
    { href: '/home', label: 'Home' },
    { href: '/placeorder', label: 'Place Order' },
    { href: '/orders', label: 'Orders' }
  ];

  return (
    <aside className="sidebar">
      <h2>EcoMart</h2>
      <nav>
        <ul>
          {links.map(link => (
            <li key={link.href}>
              <Link href={link.href} className={pathname === link.href ? 'active' : ''}>
                {link.label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
      <button type="button" className="logout" onClick={handleLogout}>
        Log Out
      </button>
    </aside>
  );
}
