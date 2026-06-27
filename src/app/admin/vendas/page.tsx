'use client';
import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';

export default function VendasAdmin() {
  const [orders, setOrders] = useState<any[]>([]);

  useEffect(() => {
    async function load() {
      const supabase = createClient();
      const { data } = await supabase
        .from('orders')
        .select('*, products(name)')
        .order('created_at', { ascending: false })
        .limit(100);
      setOrders(data || []);
    }
    load();
  }, []);

  const statusColor: Record<string, string> = {
    paid: 'text-green-400',
    pending: 'text-yellow-400',
    failed: 'text-red-400',
    refunded: 'text-cream-dim',
  };

  return (
    <div className="max-w-5xl">
      <h1 className="font-display text-3xl font-bold uppercase tracking-tight mb-8">Vendas</h1>

      {orders.length === 0 ? (
        <p className="text-cream-dim">Nenhuma venda registrada ainda.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/10 text-left">
                <th className="font-display text-xs tracking-[0.2em] uppercase text-cream-dim py-3 px-4">Data</th>
                <th className="font-display text-xs tracking-[0.2em] uppercase text-cream-dim py-3 px-4">Produto</th>
                <th className="font-display text-xs tracking-[0.2em] uppercase text-cream-dim py-3 px-4">Cliente</th>
                <th className="font-display text-xs tracking-[0.2em] uppercase text-cream-dim py-3 px-4">Valor</th>
                <th className="font-display text-xs tracking-[0.2em] uppercase text-cream-dim py-3 px-4">Status</th>
                <th className="font-display text-xs tracking-[0.2em] uppercase text-cream-dim py-3 px-4">Downloads</th>
              </tr>
            </thead>
            <tbody>
              {orders.map(o => (
                <tr key={o.id} className="border-b border-white/5 hover:bg-white/[0.02]">
                  <td className="py-3 px-4 text-sm text-cream-dim">{new Date(o.created_at).toLocaleDateString('pt-BR')}</td>
                  <td className="py-3 px-4 text-sm font-display uppercase">{o.products?.name || '—'}</td>
                  <td className="py-3 px-4 text-sm text-cream-dim">{o.customer_email}</td>
                  <td className="py-3 px-4 text-sm font-bold text-blood">R$ {(o.amount_cents/100).toFixed(2).replace('.',',')}</td>
                  <td className={`py-3 px-4 text-sm font-display uppercase ${statusColor[o.status] || ''}`}>{o.status}</td>
                  <td className="py-3 px-4 text-sm text-cream-dim">{o.download_count}/{o.max_downloads}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
