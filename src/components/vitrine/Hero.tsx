'use client';
import { Artist } from '@/lib/types';
import Link from 'next/link';

export default function Hero({ artist, subtitle }: { artist: Artist; subtitle: string }) {
  return (
    <section id="hero" className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background gradients */}
      <div className="absolute inset-0 bg-gradient-to-br from-midnight via-midnight-blue to-midnight" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_20%_50%,rgba(30,15,60,0.4),transparent_60%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_80%_20%,rgba(184,29,36,0.08),transparent_50%)]" />
      
      {/* Animated lines */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-1/4 left-0 w-full h-px bg-gradient-to-r from-transparent via-blood to-transparent" />
        <div className="absolute top-3/4 left-0 w-full h-px bg-gradient-to-r from-transparent via-blood/50 to-transparent" />
      </div>

      <div className="relative z-10 text-center px-4">
        <p className="font-display text-sm md:text-base tracking-[0.4em] uppercase text-blood mb-6 font-medium">
          {subtitle || 'Tribal House'}
        </p>
        <h1 className="font-display text-7xl md:text-9xl lg:text-[10rem] font-bold uppercase tracking-tight leading-none mb-8">
          <span className="text-gradient-blood">{artist.name}</span>
        </h1>
        <p className="font-body text-cream-dim text-lg md:text-xl max-w-xl mx-auto mb-12 font-light">
          {artist.tagline}
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/loja"
            className="px-10 py-4 bg-blood hover:bg-blood-light text-white font-display uppercase tracking-widest text-sm transition-all animate-pulse-glow"
          >
            Loja Digital
          </Link>
          <a
            href="#booking"
            className="px-10 py-4 border border-cream/20 hover:border-blood text-cream font-display uppercase tracking-widest text-sm transition-all"
          >
            Booking
          </a>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-cream-dim/40">
        <span className="text-xs tracking-widest uppercase font-display">Scroll</span>
        <div className="w-px h-8 bg-gradient-to-b from-cream-dim/40 to-transparent" />
      </div>
    </section>
  );
}
