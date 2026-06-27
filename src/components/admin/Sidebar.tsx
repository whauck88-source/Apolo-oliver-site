'use client';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

const links = [
  { href: '/admin', label: 'Dashboard', icon: '◉' },
  { href: '/admin/conteudo', label: 'Conteúdo', icon: '✎' },
  { href: '/admin/agenda', label: 'Agenda', icon: '◈' },
  { href: '/admin/produtos', label: 'Produtos', icon: '♫' },
  { href: '/admin/vendas', label: 'Vendas', icon: '$' },
];

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push('/admin/login');
  }

  return (
    <aside className="w-64 min-h-screen bg-midnight-blue border-r border-white/5 flex flex-col">
      <div className="p-6 border-b border-white/5">
        <Link href="/" className="font-display text-lg font-bold uppercase tracking-tight text-gradient-blood">
          Apolo Oliver
        </Link>
        <p className="text-cream-dim text-xs mt-1 font-display tracking-widest uppercase">Admin</p>
      </div>
      <nav className="flex-1 p-4 space-y-1">
        {links.map((link) => (
          <Link key={link.href} href={link.href}
            className={`flex items-center gap-3 px-4 py-3 text-sm font-display uppercase tracking-wider transition-colors ${
              pathname === link.href
                ? 'bg-blood/10 text-blood border-l-2 border-blood'
                : 'text-cream-dim hover:text-cream hover:bg-white/5'
            }`}>
            <span>{link.icon}</span>
            {link.label}
          </Link>
        ))}
      </nav>
      <div className="p-4 border-t border-white/5">
        <button onClick={handleLogout}
          className="w-full px-4 py-2 text-cream-dim hover:text-blood text-sm font-display uppercase tracking-widest transition-colors">
          Sair
        </button>
      </div>
    </aside>
  );
}
