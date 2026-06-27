import Link from 'next/link';

export default function CheckoutSuccess({ searchParams }: { searchParams: { session_id?: string } }) {
  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="max-w-md text-center">
        <div className="w-20 h-20 mx-auto mb-8 border-2 border-blood rounded-full flex items-center justify-center">
          <span className="text-blood text-3xl">✓</span>
        </div>
        <h1 className="font-display text-4xl font-bold uppercase tracking-tight mb-4">
          Compra Confirmada
        </h1>
        <p className="text-cream-dim font-body mb-8 leading-relaxed">
          Pagamento recebido com sucesso. O link de download foi enviado para o seu e-mail.
          Verifique também a caixa de spam.
        </p>
        <p className="text-cream-dim/50 text-sm mb-8 font-body">
          Você tem até 5 downloads e o link expira em 72 horas.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/loja"
            className="px-8 py-3 bg-blood hover:bg-blood-light text-white font-display uppercase tracking-widest text-sm transition-all">
            Continuar Comprando
          </Link>
          <Link href="/"
            className="px-8 py-3 border border-white/20 hover:border-blood text-cream font-display uppercase tracking-widest text-sm transition-all">
            Voltar ao Site
          </Link>
        </div>
      </div>
    </div>
  );
}
