import { createServerSupabase } from '@/lib/supabase/server';
import Link from 'next/link';

export const revalidate = 60;

export default async function LojaPage() {
  const supabase = createServerSupabase();
  const { data: artist } = await supabase.from('artists').select('id, name').eq('slug', 'apolo-oliver').single();
  const { data: products } = await supabase
    .from('products')
    .select('*')
    .eq('artist_id', artist?.id || '')
    .eq('is_active', true)
    .order('created_at', { ascending: false });

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="fixed top-0 w-full z-40 bg-midnight/80 backdrop-blur-md border-b border-white/5">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="font-display text-xl font-bold uppercase tracking-tight text-gradient-blood">
            {artist?.name || 'Apolo Oliver'}
          </Link>
          <Link href="/" className="text-cream-dim hover:text-cream text-sm font-display uppercase tracking-widest transition-colors">
            Voltar
          </Link>
        </div>
      </header>

      <main className="pt-24 pb-16 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <span className="font-display text-xs tracking-[0.5em] uppercase text-blood mb-4 block">Store</span>
            <h1 className="font-display text-5xl md:text-7xl font-bold uppercase tracking-tight">Loja Digital</h1>
            <p className="text-cream-dim mt-4 font-body">Faixas, packs e produções exclusivas. Download imediato.</p>
          </div>

          {(!products || products.length === 0) ? (
            <div className="text-center py-20">
              <p className="text-cream-dim text-lg">Produtos em breve.</p>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {products.map((product) => (
                <Link key={product.id} href={`/loja/${product.id}`}
                  className="group bg-white/5 border border-white/5 hover:border-blood/30 transition-all overflow-hidden">
                  <div className="aspect-square bg-gradient-to-br from-midnight-blue to-midnight flex items-center justify-center">
                    {product.cover_image_url ? (
                      <img src={product.cover_image_url} alt={product.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="text-center">
                        <span className="font-display text-6xl text-blood/20">♫</span>
                      </div>
                    )}
                  </div>
                  <div className="p-5">
                    <span className="font-display text-[10px] tracking-[0.3em] uppercase text-blood">
                      {product.product_type === 'pack' ? 'Pack' : 'Track'}
                    </span>
                    <h3 className="font-display text-lg uppercase tracking-wide mt-1 group-hover:text-blood transition-colors">
                      {product.name}
                    </h3>
                    <p className="text-cream-dim text-sm mt-2 line-clamp-2 font-body">{product.description}</p>
                    <div className="mt-4 flex items-center justify-between">
                      <span className="font-display text-2xl font-bold text-blood">
                        R$ {(product.price_cents / 100).toFixed(2).replace('.', ',')}
                      </span>
                      <span className="px-4 py-2 bg-blood/10 text-blood font-display text-xs uppercase tracking-widest group-hover:bg-blood group-hover:text-white transition-all">
                        Comprar
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
