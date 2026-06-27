export default function Manifesto({ text }: { text: string }) {
  const displayText = text || 'A pista é o altar. O grave é a oração. Cada beat é um ritual que conecta almas na escuridão. Tribal house não é gênero — é estado de espírito. É a batida ancestral encontrando o futuro. É suor, êxtase e pertencimento. Quando as luzes se apagam e o kick entra, não existe ego, não existe hierarquia. Existe apenas o momento.';

  return (
    <section id="manifesto" className="relative py-32 px-4">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_50%,rgba(184,29,36,0.05),transparent_70%)]" />
      <div className="relative max-w-3xl mx-auto text-center">
        <span className="font-display text-xs tracking-[0.5em] uppercase text-blood mb-8 block">Manifesto</span>
        <blockquote className="font-body text-xl md:text-2xl leading-relaxed text-cream/90 font-light italic">
          &ldquo;{displayText}&rdquo;
        </blockquote>
        <div className="mt-8 w-16 h-px bg-blood mx-auto" />
      </div>
    </section>
  );
}
