import AdminGuard from '@/components/admin/AdminGuard';
import Sidebar from '@/components/admin/Sidebar';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <AdminGuard>
      <div className="flex min-h-screen bg-midnight">
        <Sidebar />
        <main className="flex-1 p-8">{children}</main>
      </div>
    </AdminGuard>
  );
}
