'use client';
import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';

export default function AdminGuard({ children }: { children: React.ReactNode }) {
  const [loading, setLoading] = useState(true);
  const [authorized, setAuthorized] = useState(false);
  const router = useRouter();

  useEffect(() => {
    async function check() {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push('/admin/login'); return; }

      const { data: profile } = await supabase
        .from('admin_users')
        .select('role')
        .eq('user_id', user.id)
        .single();

      if (!profile) { router.push('/admin/login'); return; }
      setAuthorized(true);
      setLoading(false);
    }
    check();
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-midnight">
        <div className="text-cream-dim font-display tracking-widest uppercase text-sm">Carregando...</div>
      </div>
    );
  }
  if (!authorized) return null;
  return <>{children}</>;
}
