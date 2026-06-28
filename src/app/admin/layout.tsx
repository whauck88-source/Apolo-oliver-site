'use client';
import { usePathname } from 'next/navigation';
import AdminGuard from '@/components/admin/AdminGuard';
import Sidebar from '@/components/admin/Sidebar';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  // A tela de login NAO pode ficar dentro do AdminGuard, senao entra em loop
  // infinito ("Carregando...") quando o usuario ainda nao esta autenticado.
  if (pathname === '/admin/login') {
    return <>{children}</>;
  }

  return (
    <AdminGuard>
      <div className="flex min-h-screen bg-midnight">
        <Sidebar />
        <main className="flex-1 p-8">{children}</main>
      </div>
    </AdminGuard>
  );
}
