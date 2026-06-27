'use client';
import { useState } from 'react';

export default function CheckoutButton({ productId, productName }: { productId: string; productName: string }) {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleCheckout() {
    if (!email || !email.includes('@')) {
      setError('Informe um e-mail válido para receber o download.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId, email }),
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        setError(data.error || 'Erro ao criar checkout.');
      }
    } catch (e) {
      setError('Erro de conexão. Tente novamente.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-4">
      <div>
        <label className="font-display text-xs tracking-[0.2em] uppercase text-cream-dim block mb-2">
          Seu e-mail (para receber o download)
        </label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="seu@email.com"
          className="w-full px-4 py-3 bg-white/5 border border-white/10 focus:border-blood text-cream font-body outline-none transition-colors"
        />
      </div>
      {error && <p className="text-blood-light text-sm font-body">{error}</p>}
      <button
        onClick={handleCheckout}
        disabled={loading}
        className="w-full px-10 py-4 bg-blood hover:bg-blood-light disabled:opacity-50 text-white font-display uppercase tracking-widest text-sm transition-all"
      >
        {loading ? 'Processando...' : `Comprar — ${productName}`}
      </button>
    </div>
  );
}
