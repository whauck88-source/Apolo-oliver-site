'use client';
import { Artist } from '@/lib/types';
import Link from 'next/link';
import { useEffect, useState } from 'react';

const HERO_VIDEO_DESKTOP = { src: '/media/hero-16x9.mp4', poster: '/media/hero-16x9-poster.jpg' };
const HERO_VIDEO_MOBILE = { src: '/media/hero-9x16.mp4', poster: '/media/hero-9x16-poster.jpg' };

export default function Hero({ artist, subtitle }: { artist: Artist; subtitle: string }) {
  // null até montar no cliente: evita baixar os dois vídeos e mismatch de hidratação
  const [isMobile, setIsMobile] = useState<boolean | null>(null);

  useEffect(() => {
    const mq = window.matchMedia('(max-width: 767px)');
    setIsMobile(mq.matches);
    const onChange = (e: MediaQueryListEvent) => setIsMobile(e.matches);
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);

  const video = isMobile === null ? null : isMobile ? HERO_VIDEO_MOBILE : HERO_VIDEO_DESKTOP;

  return (
    <section id="hero" className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Fallback: base escura + posters até o vídeo montar */}
      <div className="absolute inset-0 bg-midnight" />
      <img
        src={HERO_VIDEO_DESKTOP.poster}
        alt=""
        aria-hidden="true"
        className="absolute inset-0 w-full h-full object-cover hidden md:block"
      />
      <img
        src={HERO_VIDEO_MOBILE.poster}
        alt=""
        aria-hidden="true"
        className="absolute inset-0 w-full h-full object-cover md:hidden"
      />

      {/* Vídeo de fundo: 16x9 no desktop, 9x16 no mobile (<768px) */}
      {video && (
        <video
          key={video.src}
          className="absolute inset-0 w-full h-full object-cover"
          src={video.src}
          poster={video.poster}
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
        />
      )}

      {/* Overlay para legibilidade do texto */}
      <div className="absolute inset-0 bg-gradient-to-b from-midnight/70 via-midnight/40 to-midnight" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_80%_20%,rgba(184,29,36,0.08),transparent_50%)]" />

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
