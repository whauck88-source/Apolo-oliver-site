export default function EPK({ epkUrl }: { epkUrl: string | null }) {
  return (
    <section id="epk" className="relative py-24 px-4">
      <div className="max-w-2xl mx-auto text-center">
        <span className="font-display text-xs tracking-[0.5em] uppercase text-blood mb-4 block">Press</span>
        <h2 className="font-display text-4xl md:text-5xl font-bold uppercase mb-6 tracking-tight">Electronic Press Kit</h2>
        <p className="text-cream-dim mb-8 font-body">Fotos em alta, bio, rider técnico e histórico profissional.</p>
        {epkUrl ? (
          <a href={epkUrl} target="_blank" rel="noopener noreferrer"
            className="inline-block px-10 py-4 bg-white/5 border border-white/10 hover:border-blood text-cream font-display uppercase tracking-widest text-sm transition-all">
            Download EPK
          </a>
        ) : (
          <p className="text-cream-dim/50 text-sm">EPK em preparação</p>
        )}
      </div>
    </section>
  );
}
