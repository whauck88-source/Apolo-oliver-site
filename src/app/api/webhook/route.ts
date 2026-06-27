import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { createAdminClient } from '@/lib/supabase/admin';
import crypto from 'crypto';

export async function POST(req: NextRequest) {
  const body = await req.text();
  const sig = req.headers.get('stripe-signature')!;

  let event;
  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET!);
  } catch (err: any) {
    console.error('Webhook signature error:', err.message);
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as any;
    const productId = session.metadata?.product_id;
    const customerEmail = session.metadata?.customer_email || session.customer_email;

    if (!productId || !customerEmail) {
      return NextResponse.json({ error: 'Missing metadata' }, { status: 400 });
    }

    const supabase = createAdminClient();
    const downloadToken = crypto.randomUUID();
    const tokenExpires = new Date(Date.now() + 72 * 60 * 60 * 1000).toISOString(); // 72h

    const { data: product } = await supabase.from('products').select('price_cents, currency').eq('id', productId).single();

    // Create order
    await supabase.from('orders').insert({
      product_id: productId,
      customer_email: customerEmail,
      amount_cents: product?.price_cents || session.amount_total,
      currency: product?.currency || 'brl',
      stripe_session_id: session.id,
      stripe_payment_intent: session.payment_intent,
      status: 'paid',
      download_token: downloadToken,
      download_count: 0,
      max_downloads: 5,
      token_expires_at: tokenExpires,
    });

    // In production, send email with download link here
    // For now, the link is: /api/download/{downloadToken}
    console.log(`[ORDER] Download link: ${process.env.NEXT_PUBLIC_SITE_URL}/api/download/${downloadToken}`);
  }

  return NextResponse.json({ received: true });
}
