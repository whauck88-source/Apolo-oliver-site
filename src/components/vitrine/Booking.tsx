export default function Booking({ email, whatsapp }: { email: string; whatsapp: string | null }) {
  return (
    <section id="booking" className="relative py-32 px-4 bg-white/[0.02]">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_100%,rgba(184,29,36,0.06),transparent_60%)]" />
      <div className="relative max-w-2xl mx-auto text-center">
        <span className="font-display text-xs tracking-[0.5em] uppercase text-blood mb-4 block">Contato</span>
        <h2 className="font-display text-4xl md:text-6xl font-bold uppercase mb-6 tracking-tight">Booking</h2>
        <p className="text-cream-dim mb-10 font-body">Interessado em levar o som para o seu evento? Entre em contato.</p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <a href={`mailto:${email}`}
            className="px-10 py-4 bg-blood hover:bg-blood-light text-white font-display uppercase tracking-widest text-sm transition-all">
            E-mail
          </a>
          {whatsapp && (
            <a href={`https://wa.me/${whatsapp.replace(/\D/g, '')}`} target="_blank" rel="noopener noreferrer"
              className="px-10 py-4 border border-cream/20 hover:border-blood text-cream font-display uppercase tracking-widest text-sm transition-all">
              WhatsApp
            </a>
          )}
        </div>
      </div>
    </section>
  );
}
