import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';

export async function GET(req: NextRequest, { params }: { params: { orderId: string } }) {
  const supabase = createAdminClient();

  const { data: order, error } = await supabase
    .from('orders')
    .select('*, products(*)')
    .eq('download_token', params.orderId)
    .eq('status', 'paid')
    .single();

  if (error || !order) {
    return NextResponse.json({ error: 'Link inválido ou expirado' }, { status: 404 });
  }

  // Check expiration
  if (new Date(order.token_expires_at) < new Date()) {
    return NextResponse.json({ error: 'Link expirado. Entre em contato para suporte.' }, { status: 410 });
  }

  // Check download limit
  if (order.download_count >= order.max_downloads) {
    return NextResponse.json({ error: 'Limite de downloads atingido.' }, { status: 429 });
  }

  // Increment download count
  await supabase
    .from('orders')
    .update({ download_count: order.download_count + 1 })
    .eq('id', order.id);

  // Generate signed URL from Supabase Storage
  const product = order.products;
  if (!product?.file_path) {
    return NextResponse.json({ error: 'Arquivo não encontrado' }, { status: 404 });
  }

  const { data: signedUrl } = await supabase.storage
    .from('products')
    .createSignedUrl(product.file_path, 300); // 5 min

  if (!signedUrl?.signedUrl) {
    return NextResponse.json({ error: 'Erro ao gerar download' }, { status: 500 });
  }

  return NextResponse.redirect(signedUrl.signedUrl);
}
