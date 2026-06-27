'use client';
import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';

export default function AdminDashboard() {
  const [stats, setStats] = useState({ products: 0, orders: 0, revenue: 0, events: 0 });

  useEffect(() => {
    async function load() {
      const supabase = createClient();
      const [prodRes, ordRes, evRes] = await Promise.all([
        supabase.from('products').select('id', { count: 'exact', head: true }).eq('is_active', true),
        supabase.from('orders').select('amount_cents').eq('status', 'paid'),
        supabase.from('schedule_events').select('id', { count: 'exact', head: true }).eq('is_published', true),
      ]);
      const revenue = (ordRes.data || []).reduce((sum: number, o: any) => sum + o.amount_cents, 0);
      setStats({
        products: prodRes.count || 0,
        orders: (ordRes.data || []).length,
        revenue,
        events: evRes.count || 0,
      });
    }
    load();
  }, []);

  const cards = [
    { label: 'Produtos Ativos', value: stats.products, color: 'text-blood' },
    { label: 'Vendas Realizadas', value: stats.orders, color: 'text-blood' },
    { label: 'Receita Total', value: `R$ ${(stats.revenue / 100).toFixed(2).replace('.', ',')}`, color: 'text-blood' },
    { label: 'Eventos Agendados', value: stats.events, color: 'text-blood' },
  ];

  return (
    <div>
      <h1 className="font-display text-3xl font-bold uppercase tracking-tight mb-8">Dashboard</h1>
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {cards.map((c) => (
          <div key={c.label} className="bg-white/5 border border-white/5 p-6">
            <p className="font-display text-xs tracking-[0.3em] uppercase text-cream-dim mb-2">{c.label}</p>
            <p className={`font-display text-3xl font-bold ${c.color}`}>{c.value}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
