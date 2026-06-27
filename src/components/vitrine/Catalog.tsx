export default function Catalog({ spotifyEmbed, soundcloudEmbed }: { spotifyEmbed: string; soundcloudEmbed: string }) {
  return (
    <section id="catalog" className="relative py-24 px-4">
      <div className="max-w-5xl mx-auto">
        <span className="font-display text-xs tracking-[0.5em] uppercase text-blood mb-4 block text-center">Releases</span>
        <h2 className="font-display text-4xl md:text-6xl font-bold uppercase text-center mb-16 tracking-tight">Catálogo</h2>
        <div className="grid md:grid-cols-2 gap-8">
          {spotifyEmbed ? (
            <div className="bg-white/5 rounded-lg p-4 backdrop-blur-sm border border-white/5">
              <h3 className="font-display text-sm tracking-[0.3em] uppercase text-cream-dim mb-4">Spotify</h3>
              <div dangerouslySetInnerHTML={{ __html: spotifyEmbed }} />
            </div>
          ) : (
            <div className="bg-white/5 rounded-lg p-8 backdrop-blur-sm border border-white/5 flex items-center justify-center min-h-[352px]">
              <div className="text-center text-cream-dim">
                <p className="font-display text-sm tracking-[0.3em] uppercase mb-2">Spotify</p>
                <p className="text-sm">Em breve</p>
              </div>
            </div>
          )}
          {soundcloudEmbed ? (
            <div className="bg-white/5 rounded-lg p-4 backdrop-blur-sm border border-white/5">
              <h3 className="font-display text-sm tracking-[0.3em] uppercase text-cream-dim mb-4">SoundCloud</h3>
              <div dangerouslySetInnerHTML={{ __html: soundcloudEmbed }} />
            </div>
          ) : (
            <div className="bg-white/5 rounded-lg p-8 backdrop-blur-sm border border-white/5 flex items-center justify-center min-h-[352px]">
              <div className="text-center text-cream-dim">
                <p className="font-display text-sm tracking-[0.3em] uppercase mb-2">SoundCloud</p>
                <p className="text-sm">Em breve</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
