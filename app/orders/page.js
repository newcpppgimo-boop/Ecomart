'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '../../lib/useUser';
import { apiFetch } from '../../lib/apiFetch';
import Sidebar from '../../components/Sidebar';

export default function OrdersPage() {
  const { user, loading } = useUser();
  const router = useRouter();
  const [cart, setCart] = useState([]);
  const [cartLoading, setCartLoading] = useState(true);
  const [error, setError] = useState('');
  const [checkingOut, setCheckingOut] = useState(false);

  useEffect(() => {
    if (!loading && !user) router.replace('/login');
  }, [loading, user, router]);

  const loadCart = useCallback(async () => {
    setCartLoading(true);
    try {
      const { cart } = await apiFetch('/api/cart');
      setCart(cart || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setCartLoading(false);
    }
  }, []);

  useEffect(() => {
    if (user) loadCart();
  }, [user, loadCart]);

  async function changeQuantity(item, delta) {
    const nextQty = item.quantity + delta;
    // Optimistic update so the click feels instant.
    setCart(prev =>
      nextQty <= 0
        ? prev.filter(i => i.id !== item.id)
        : prev.map(i => (i.id === item.id ? { ...i, quantity: nextQty } : i))
    );
    try {
      await apiFetch('/api/cart', {
        method: 'PATCH',
        body: JSON.stringify({ id: item.id, quantity: nextQty })
      });
    } catch (err) {
      setError(err.message);
      loadCart(); // reconcile with the server if something went wrong
    }
  }

  async function removeItem(item) {
    setCart(prev => prev.filter(i => i.id !== item.id));
    try {
      await apiFetch(`/api/cart?id=${item.id}`, { method: 'DELETE' });
    } catch (err) {
      setError(err.message);
      loadCart();
    }
  }

  async function checkout() {
    setCheckingOut(true);
    setError('');
    try {
      await apiFetch('/api/checkout', { method: 'POST' });
      setCart([]);
    } catch (err) {
      setError(err.message);
    } finally {
      setCheckingOut(false);
    }
  }

  if (loading || !user) return <div className="loading-state">Loading…</div>;

  const totalItems = cart.reduce((sum, i) => sum + i.quantity, 0);
  const totalPrice = cart.reduce((sum, i) => sum + i.quantity * (i.products?.price || 0), 0);

  return (
    <div className="container">
      <Sidebar />
      <main className="content">
        <h1>Your Orders</h1>

        {error && <p className="form-error">{error}</p>}
        {cartLoading && <p className="loading-state">Loading cart…</p>}

        {!cartLoading && (
          <ul id="order-list">
            {cart.length === 0 && (
              <li className="empty-state">Your cart is empty. Add something reusable to get started.</li>
            )}
            {cart.map(item => (
              <li className="order-item" key={item.id}>
                <div className="item-info">
                  <span className="item-name">{item.products?.name}</span>
                  <span className="item-price">₱{Number(item.products?.price).toFixed(2)} each</span>
                </div>
                <div className="quantity-controls">
                  <button type="button" onClick={() => changeQuantity(item, -1)} aria-label="Decrease quantity">−</button>
                  <span>{item.quantity}</span>
                  <button type="button" onClick={() => changeQuantity(item, 1)} aria-label="Increase quantity">+</button>
                </div>
                <span className="item-subtotal">₱{(item.quantity * item.products?.price).toFixed(2)}</span>
                <button type="button" className="remove-btn" onClick={() => removeItem(item)}>Remove</button>
              </li>
            ))}
          </ul>
        )}

        <div className="order-summary">
          <p>Items in cart: {totalItems}</p>
          <p>Total: ₱{totalPrice.toFixed(2)}</p>
          {cart.length > 0 ? (
            <button className="shop-btn" onClick={checkout} disabled={checkingOut}>
              {checkingOut ? 'Placing order…' : 'Checkout'}
            </button>
          ) : (
            <button className="shop-btn" onClick={() => router.push('/placeorder')}>Shop Now</button>
          )}
        </div>
      </main>
    </div>
  );
}
