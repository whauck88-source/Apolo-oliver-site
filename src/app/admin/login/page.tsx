'use client';
import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';

export default function AdminLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      setError('Credenciais inválidas.');
      setLoading(false);
    } else {
      router.push('/admin');
      router.refresh();
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-midnight">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <h1 className="font-display text-3xl font-bold uppercase tracking-tight">Painel Admin</h1>
          <p className="text-cream-dim text-sm mt-2">Acesse com suas credenciais</p>
        </div>
        <form onSubmit={handleLogin} className="space-y-4">
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
            placeholder="E-mail" required
            className="w-full px-4 py-3 bg-white/5 border border-white/10 focus:border-blood text-cream outline-none font-body" />
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)}
            placeholder="Senha" required
            className="w-full px-4 py-3 bg-white/5 border border-white/10 focus:border-blood text-cream outline-none font-body" />
          {error && <p className="text-blood-light text-sm">{error}</p>}
          <button type="submit" disabled={loading}
            className="w-full py-3 bg-blood hover:bg-blood-light disabled:opacity-50 text-white font-display uppercase tracking-widest text-sm transition-all">
            {loading ? 'Entrando...' : 'Entrar'}
          </button>
        </form>
      </div>
    </div>
  );
}
