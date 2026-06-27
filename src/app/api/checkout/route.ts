import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { createAdminClient } from '@/lib/supabase/admin';

export async function POST(req: NextRequest) {
  try {
    const { productId, email } = await req.json();
    if (!productId || !email) {
      return NextResponse.json({ error: 'productId e email são obrigatórios' }, { status: 400 });
    }

    const supabase = createAdminClient();
    const { data: product, error } = await supabase
      .from('products')
      .select('*')
      .eq('id', productId)
      .eq('is_active', true)
      .single();

    if (error || !product) {
      return NextResponse.json({ error: 'Produto não encontrado' }, { status: 404 });
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      customer_email: email,
      line_items: [
        {
          price_data: {
            currency: product.currency || 'brl',
            product_data: {
              name: product.name,
              description: product.description || undefined,
            },
            unit_amount: product.price_cents,
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${process.env.NEXT_PUBLIC_SITE_URL}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_SITE_URL}/loja/${productId}`,
      metadata: {
        product_id: productId,
        customer_email: email,
      },
    });

    return NextResponse.json({ url: session.url });
  } catch (err: any) {
    console.error('Checkout error:', err);
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
  }
}
