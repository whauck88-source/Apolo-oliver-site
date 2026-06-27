import { createServerSupabase } from '@/lib/supabase/server';
import Link from 'next/link';
import CheckoutButton from '@/components/loja/CheckoutButton';

export default async function ProductPage({ params }: { params: { productId: string } }) {
  const supabase = createServerSupabase();
  const { data: product } = await supabase
    .from('products')
    .select('*, artists(name, slug)')
    .eq('id', params.productId)
    .eq('is_active', true)
    .single();

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="font-display text-4xl uppercase mb-4">Produto não encontrado</h1>
          <Link href="/loja" className="text-blood hover:underline">Voltar à loja</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <header className="fixed top-0 w-full z-40 bg-midnight/80 backdrop-blur-md border-b border-white/5">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="font-display text-xl font-bold uppercase tracking-tight text-gradient-blood">
            Apolo Oliver
          </Link>
          <Link href="/loja" className="text-cream-dim hover:text-cream text-sm font-display uppercase tracking-widest transition-colors">
            Voltar à Loja
          </Link>
        </div>
      </header>

      <main className="pt-24 pb-16 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12">
            {/* Cover */}
            <div className="aspect-square bg-gradient-to-br from-midnight-blue to-midnight border border-white/5 flex items-center justify-center overflow-hidden">
              {product.cover_image_url ? (
                <img src={product.cover_image_url} alt={product.name} className="w-full h-full object-cover" />
              ) : (
                <span className="font-display text-8xl text-blood/20">♫</span>
              )}
            </div>

            {/* Details */}
            <div className="flex flex-col justify-center">
              <span className="font-display text-xs tracking-[0.3em] uppercase text-blood mb-2">
                {product.product_type === 'pack' ? 'Pack' : 'Track'}
              </span>
              <h1 className="font-display text-4xl md:text-5xl font-bold uppercase tracking-tight mb-4">
                {product.name}
              </h1>
              <p className="text-cream-dim font-body leading-relaxed mb-8">{product.description}</p>
              <div className="mb-8">
                <span className="font-display text-4xl font-bold text-blood">
                  R$ {(product.price_cents / 100).toFixed(2).replace('.', ',')}
                </span>
              </div>
              <CheckoutButton productId={product.id} productName={product.name} />
              <p className="text-cream-dim/40 text-xs mt-4 font-body">
                Pagamento seguro via Stripe. Cartão internacional ou Pix. Download imediato após confirmação.
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
