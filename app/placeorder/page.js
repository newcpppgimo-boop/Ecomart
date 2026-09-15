'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '../../lib/useUser';
import { apiFetch } from '../../lib/apiFetch';
import Sidebar from '../../components/Sidebar';

export default function PlaceOrderPage() {
  const { user, loading } = useUser();
  const router = useRouter();
  const [products, setProducts] = useState([]);
  const [productsLoading, setProductsLoading] = useState(true);
  const [error, setError] = useState('');
  const [toast, setToast] = useState('');
  const [addingId, setAddingId] = useState(null);

  useEffect(() => {
    if (!loading && !user) router.replace('/login');
  }, [loading, user, router]);

  useEffect(() => {
    fetch('/api/products')
      .then(res => res.json())
      .then(({ products, error }) => {
        if (error) setError(error);
        else setProducts(products || []);
      })
      .catch(() => setError('Could not load products.'))
      .finally(() => setProductsLoading(false));
  }, []);

  function showToast(message) {
    setToast(message);
    setTimeout(() => setToast(''), 1600);
  }

  async function addToCart(product) {
    setAddingId(product.id);
    try {
      await apiFetch('/api/cart', {
        method: 'POST',
        body: JSON.stringify({ product_id: product.id })
      });
      showToast(`${product.name} added to cart`);
    } catch (err) {
      showToast(err.message);
    } finally {
      setAddingId(null);
    }
  }

  if (loading || !user) return <div className="loading-state">Loading…</div>;

  return (
    <div className="container">
      <Sidebar />
      <main className="product-grid">
        {productsLoading && <p className="loading-state">Loading products…</p>}
        {error && <p className="error-state">{error}</p>}
        {!productsLoading && !error && products.length === 0 && (
          <p className="empty-state">No products yet — add some via the /api/products endpoint.</p>
        )}

        {products.map(product => (
          <div className="product-card" key={product.id}>
            <div className="product-image">
              <img src={product.image_url || '/logo.png'} alt={product.name} />
            </div>
            <h3 className="product-name">{product.name}</h3>
            <p className="price">₱{Number(product.price).toFixed(2)}</p>
            <div className="actions">
              <button
                className="cart-btn"
                aria-label="Add to cart"
                onClick={() => addToCart(product)}
                disabled={addingId === product.id}
              >
                <img src="/cart.png" alt="" />
              </button>
              <button className="shop-btn" onClick={() => router.push('/orders')}>
                Shop Now
              </button>
            </div>
          </div>
        ))}
      </main>

      <div
        style={{
          position: 'fixed', left: '50%', bottom: 28, transform: `translate(-50%, ${toast ? '0' : '20px'})`,
          background: '#123B2C', color: '#fff', padding: '0.75rem 1.25rem', borderRadius: 10,
          fontSize: '0.9rem', fontWeight: 600, opacity: toast ? 1 : 0,
          transition: 'opacity 0.2s ease, transform 0.2s ease', pointerEvents: 'none', zIndex: 999
        }}
      >
        {toast}
      </div>
    </div>
  );
}
