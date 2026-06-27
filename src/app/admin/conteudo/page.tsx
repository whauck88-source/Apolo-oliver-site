'use client';
import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';

export default function ConteudoAdmin() {
  const [artist, setArtist] = useState<any>(null);
  const [content, setContent] = useState<any[]>([]);
  const [authority, setAuthority] = useState<any[]>([]);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState('');

  useEffect(() => {
    async function load() {
      const supabase = createClient();
      const { data: a } = await supabase.from('artists').select('*').eq('slug', 'apolo-oliver').single();
      if (!a) return;
      setArtist(a);
      const { data: c } = await supabase.from('content_blocks').select('*').eq('artist_id', a.id).order('sort_order');
      const { data: auth } = await supabase.from('authority_numbers').select('*').eq('artist_id', a.id).order('sort_order');
      setContent(c || []);
      setAuthority(auth || []);
    }
    load();
  }, []);

  async function saveArtist() {
    setSaving(true);
    const supabase = createClient();
    await supabase.from('artists').update({
      name: artist.name, tagline: artist.tagline, bio: artist.bio,
      booking_email: artist.booking_email, booking_whatsapp: artist.booking_whatsapp,
      spotify_url: artist.spotify_url, soundcloud_url: artist.soundcloud_url,
      instagram_url: artist.instagram_url, youtube_url: artist.youtube_url, tiktok_url: artist.tiktok_url,
      epk_url: artist.epk_url,
    }).eq('id', artist.id);
    setMsg('Salvo!');
    setSaving(false);
    setTimeout(() => setMsg(''), 2000);
  }

  async function saveContent(id: string, value: string) {
    const supabase = createClient();
    await supabase.from('content_blocks').update({ value }).eq('id', id);
  }

  async function saveAuthority(id: string, label: string, value: string) {
    const supabase = createClient();
    await supabase.from('authority_numbers').update({ label, value }).eq('id', id);
  }

  if (!artist) return <p className="text-cream-dim">Carregando...</p>;

  const inputClass = "w-full px-3 py-2 bg-white/5 border border-white/10 focus:border-blood text-cream outline-none font-body text-sm";
  const labelClass = "font-display text-xs tracking-[0.2em] uppercase text-cream-dim block mb-1";

  return (
    <div className="max-w-3xl">
      <h1 className="font-display text-3xl font-bold uppercase tracking-tight mb-8">Conteúdo</h1>

      {/* Artist info */}
      <div className="bg-white/5 border border-white/5 p-6 mb-6 space-y-4">
        <h2 className="font-display text-lg uppercase tracking-wide mb-4">Dados do Artista</h2>
        <div className="grid md:grid-cols-2 gap-4">
          <div><label className={labelClass}>Nome</label><input value={artist.name||''} onChange={e=>setArtist({...artist,name:e.target.value})} className={inputClass}/></div>
          <div><label className={labelClass}>Tagline</label><input value={artist.tagline||''} onChange={e=>setArtist({...artist,tagline:e.target.value})} className={inputClass}/></div>
          <div><label className={labelClass}>E-mail Booking</label><input value={artist.booking_email||''} onChange={e=>setArtist({...artist,booking_email:e.target.value})} className={inputClass}/></div>
          <div><label className={labelClass}>WhatsApp</label><input value={artist.booking_whatsapp||''} onChange={e=>setArtist({...artist,booking_whatsapp:e.target.value})} className={inputClass}/></div>
          <div><label className={labelClass}>Spotify URL</label><input value={artist.spotify_url||''} onChange={e=>setArtist({...artist,spotify_url:e.target.value})} className={inputClass}/></div>
          <div><label className={labelClass}>SoundCloud URL</label><input value={artist.soundcloud_url||''} onChange={e=>setArtist({...artist,soundcloud_url:e.target.value})} className={inputClass}/></div>
          <div><label className={labelClass}>Instagram</label><input value={artist.instagram_url||''} onChange={e=>setArtist({...artist,instagram_url:e.target.value})} className={inputClass}/></div>
          <div><label className={labelClass}>YouTube</label><input value={artist.youtube_url||''} onChange={e=>setArtist({...artist,youtube_url:e.target.value})} className={inputClass}/></div>
          <div><label className={labelClass}>TikTok</label><input value={artist.tiktok_url||''} onChange={e=>setArtist({...artist,tiktok_url:e.target.value})} className={inputClass}/></div>
          <div><label className={labelClass}>EPK URL</label><input value={artist.epk_url||''} onChange={e=>setArtist({...artist,epk_url:e.target.value})} className={inputClass}/></div>
        </div>
        <div className="flex items-center gap-4">
          <button onClick={saveArtist} disabled={saving} className="px-6 py-2 bg-blood hover:bg-blood-light text-white font-display uppercase tracking-widest text-xs transition-all disabled:opacity-50">
            {saving ? 'Salvando...' : 'Salvar'}
          </button>
          {msg && <span className="text-green-400 text-sm">{msg}</span>}
        </div>
      </div>

      {/* Content blocks */}
      <div className="bg-white/5 border border-white/5 p-6 mb-6 space-y-4">
        <h2 className="font-display text-lg uppercase tracking-wide mb-4">Blocos de Conteúdo</h2>
        {content.map(c => (
          <div key={c.id}>
            <label className={labelClass}>{c.section} / {c.key}</label>
            <textarea defaultValue={c.value} onBlur={e => saveContent(c.id, e.target.value)} rows={3}
              className={inputClass + ' resize-y'} />
          </div>
        ))}
      </div>

      {/* Authority numbers */}
      <div className="bg-white/5 border border-white/5 p-6 space-y-4">
        <h2 className="font-display text-lg uppercase tracking-wide mb-4">Números de Autoridade</h2>
        {authority.map(a => (
          <div key={a.id} className="grid grid-cols-2 gap-4">
            <div><label className={labelClass}>Label</label><input defaultValue={a.label} onBlur={e => saveAuthority(a.id, e.target.value, a.value)} className={inputClass}/></div>
            <div><label className={labelClass}>Valor</label><input defaultValue={a.value} onBlur={e => saveAuthority(a.id, a.label, e.target.value)} className={inputClass}/></div>
          </div>
        ))}
      </div>
    </div>
  );
}
