'use client';
import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';

const empty = { event_name: '', venue: '', city: '', country: 'Brasil', event_date: '', ticket_url: '', is_published: true };

export default function AgendaAdmin() {
  const [events, setEvents] = useState<any[]>([]);
  const [form, setForm] = useState(empty);
  const [editing, setEditing] = useState<string | null>(null);
  const [artistId, setArtistId] = useState('');

  useEffect(() => {
    async function load() {
      const supabase = createClient();
      const { data: a } = await supabase.from('artists').select('id').eq('slug', 'apolo-oliver').single();
      if (!a) return;
      setArtistId(a.id);
      const { data } = await supabase.from('schedule_events').select('*').eq('artist_id', a.id).order('event_date');
      setEvents(data || []);
    }
    load();
  }, []);

  async function save() {
    const supabase = createClient();
    if (editing) {
      await supabase.from('schedule_events').update(form).eq('id', editing);
    } else {
      await supabase.from('schedule_events').insert({ ...form, artist_id: artistId });
    }
    setForm(empty); setEditing(null);
    const { data } = await supabase.from('schedule_events').select('*').eq('artist_id', artistId).order('event_date');
    setEvents(data || []);
  }

  async function remove(id: string) {
    const supabase = createClient();
    await supabase.from('schedule_events').delete().eq('id', id);
    setEvents(events.filter(e => e.id !== id));
  }

  const inputClass = "w-full px-3 py-2 bg-white/5 border border-white/10 focus:border-blood text-cream outline-none font-body text-sm";

  return (
    <div className="max-w-4xl">
      <h1 className="font-display text-3xl font-bold uppercase tracking-tight mb-8">Agenda</h1>

      {/* Form */}
      <div className="bg-white/5 border border-white/5 p-6 mb-8 space-y-4">
        <h2 className="font-display text-lg uppercase tracking-wide">{editing ? 'Editar Evento' : 'Novo Evento'}</h2>
        <div className="grid md:grid-cols-2 gap-4">
          <input placeholder="Nome do evento" value={form.event_name} onChange={e => setForm({...form, event_name: e.target.value})} className={inputClass} />
          <input placeholder="Venue" value={form.venue} onChange={e => setForm({...form, venue: e.target.value})} className={inputClass} />
          <input placeholder="Cidade" value={form.city} onChange={e => setForm({...form, city: e.target.value})} className={inputClass} />
          <input placeholder="País" value={form.country} onChange={e => setForm({...form, country: e.target.value})} className={inputClass} />
          <input type="date" value={form.event_date} onChange={e => setForm({...form, event_date: e.target.value})} className={inputClass} />
          <input placeholder="URL ingressos (opcional)" value={form.ticket_url} onChange={e => setForm({...form, ticket_url: e.target.value})} className={inputClass} />
        </div>
        <label className="flex items-center gap-2 text-sm text-cream-dim">
          <input type="checkbox" checked={form.is_published} onChange={e => setForm({...form, is_published: e.target.checked})} className="accent-blood" /> Publicado
        </label>
        <div className="flex gap-2">
          <button onClick={save} className="px-6 py-2 bg-blood hover:bg-blood-light text-white font-display uppercase tracking-widest text-xs">
            {editing ? 'Atualizar' : 'Adicionar'}
          </button>
          {editing && <button onClick={() => { setForm(empty); setEditing(null); }} className="px-6 py-2 border border-white/10 text-cream-dim font-display uppercase tracking-widest text-xs">Cancelar</button>}
        </div>
      </div>

      {/* List */}
      <div className="space-y-2">
        {events.map(ev => (
          <div key={ev.id} className="flex items-center justify-between bg-white/5 border border-white/5 px-4 py-3">
            <div>
              <span className="font-display text-sm uppercase">{ev.event_name}</span>
              <span className="text-cream-dim text-xs ml-3">{ev.event_date} — {ev.city}</span>
              {!ev.is_published && <span className="text-blood text-xs ml-2">(rascunho)</span>}
            </div>
            <div className="flex gap-2">
              <button onClick={() => { setForm(ev); setEditing(ev.id); }} className="text-cream-dim hover:text-cream text-xs font-display uppercase">Editar</button>
              <button onClick={() => remove(ev.id)} className="text-blood hover:text-blood-light text-xs font-display uppercase">Excluir</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
