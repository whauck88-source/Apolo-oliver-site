'use client';
import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';

export default function ProdutosAdmin() {
  const [products, setProducts] = useState<any[]>([]);
  const [artistId, setArtistId] = useState('');
  const [form, setForm] = useState({ name: '', description: '', price: '', product_type: 'track' as 'track'|'pack', is_active: true });
  const [editing, setEditing] = useState<string|null>(null);
  const [file, setFile] = useState<File|null>(null);

  useEffect(() => {
    async function load() {
      const supabase = createClient();
      const { data: a } = await supabase.from('artists').select('id').eq('slug', 'apolo-oliver').single();
      if (!a) return;
      setArtistId(a.id);
      const { data } = await supabase.from('products').select('*').eq('artist_id', a.id).order('created_at', { ascending: false });
      setProducts(data || []);
    }
    load();
  }, []);

  async function save() {
    const supabase = createClient();
    const priceCents = Math.round(parseFloat(form.price.replace(',', '.')) * 100);
    let filePath = '';

    if (file) {
      const ext = file.name.split('.').pop();
      const path = `${artistId}/${Date.now()}.${ext}`;
      await supabase.storage.from('products').upload(path, file);
      filePath = path;
    }

    const payload: any = {
      name: form.name, description: form.description, price_cents: priceCents,
      currency: 'brl', product_type: form.product_type, is_active: form.is_active,
    };
    if (filePath) payload.file_path = filePath;

    if (editing) {
      await supabase.from('products').update(payload).eq('id', editing);
    } else {
      payload.artist_id = artistId;
      payload.file_path = filePath || 'placeholder';
      await supabase.from('products').insert(payload);
    }

    setForm({ name: '', description: '', price: '', product_type: 'track', is_active: true });
    setEditing(null); setFile(null);
    const { data } = await supabase.from('products').select('*').eq('artist_id', artistId).order('created_at', { ascending: false });
    setProducts(data || []);
  }

  async function toggleActive(id: string, current: boolean) {
    const supabase = createClient();
    await supabase.from('products').update({ is_active: !current }).eq('id', id);
    setProducts(products.map(p => p.id === id ? { ...p, is_active: !current } : p));
  }

  const inputClass = "w-full px-3 py-2 bg-white/5 border border-white/10 focus:border-blood text-cream outline-none font-body text-sm";

  return (
    <div className="max-w-4xl">
      <h1 className="font-display text-3xl font-bold uppercase tracking-tight mb-8">Produtos</h1>

      <div className="bg-white/5 border border-white/5 p-6 mb-8 space-y-4">
        <h2 className="font-display text-lg uppercase tracking-wide">{editing ? 'Editar Produto' : 'Novo Produto'}</h2>
        <div className="grid md:grid-cols-2 gap-4">
          <input placeholder="Nome" value={form.name} onChange={e => setForm({...form, name: e.target.value})} className={inputClass} />
          <input placeholder="Preço (ex: 29,90)" value={form.price} onChange={e => setForm({...form, price: e.target.value})} className={inputClass} />
          <select value={form.product_type} onChange={e => setForm({...form, product_type: e.target.value as any})} className={inputClass}>
            <option value="track">Track</option>
            <option value="pack">Pack</option>
          </select>
          <input type="file" onChange={e => setFile(e.target.files?.[0] || null)} className={inputClass} />
        </div>
        <textarea placeholder="Descrição" value={form.description} onChange={e => setForm({...form, description: e.target.value})} rows={3} className={inputClass + ' resize-y'} />
        <div className="flex gap-2">
          <button onClick={save} className="px-6 py-2 bg-blood hover:bg-blood-light text-white font-display uppercase tracking-widest text-xs">
            {editing ? 'Atualizar' : 'Adicionar'}
          </button>
          {editing && <button onClick={() => { setForm({ name: '', description: '', price: '', product_type: 'track', is_active: true }); setEditing(null); }} className="px-6 py-2 border border-white/10 text-cream-dim font-display uppercase tracking-widest text-xs">Cancelar</button>}
        </div>
      </div>

      <div className="space-y-2">
        {products.map(p => (
          <div key={p.id} className="flex items-center justify-between bg-white/5 border border-white/5 px-4 py-3">
            <div>
              <span className="font-display text-sm uppercase">{p.name}</span>
              <span className="text-blood text-sm ml-3 font-bold">R$ {(p.price_cents/100).toFixed(2).replace('.',',')}</span>
              <span className={`text-xs ml-2 ${p.is_active ? 'text-green-400' : 'text-cream-dim'}`}>{p.is_active ? 'ativo' : 'inativo'}</span>
            </div>
            <div className="flex gap-2">
              <button onClick={() => { setForm({ name: p.name, description: p.description, price: (p.price_cents/100).toFixed(2), product_type: p.product_type, is_active: p.is_active }); setEditing(p.id); }}
                className="text-cream-dim hover:text-cream text-xs font-display uppercase">Editar</button>
              <button onClick={() => toggleActive(p.id, p.is_active)}
                className="text-cream-dim hover:text-cream text-xs font-display uppercase">{p.is_active ? 'Desativar' : 'Ativar'}</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
