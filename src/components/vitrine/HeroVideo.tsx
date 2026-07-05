'use client';
import { useEffect, useRef, useState } from 'react';

const MOBILE_QUERY = '(max-width: 767px)';

const SOURCES = {
  desktop: {
    webm: '/media/hero-16x9.webm',
    mp4: '/media/hero-16x9.mp4',
    poster: '/media/hero-poster.jpg',
    fallback: '/media/hero-fallback.jpg',
  },
  mobile: {
    webm: '/media/hero-9x16.webm',
    mp4: '/media/hero-9x16.mp4',
    poster: '/media/hero-poster-vertical.jpg',
    fallback: '/media/hero-fallback-vertical.jpg',
  },
} as const;

/** Detecta conexão lenta / economia de dados (Network Information API). */
function prefersStaticImage(): boolean {
  const conn = (navigator as any).connection;
  if (!conn) return false;
  if (conn.saveData) return true;
  return conn.effectiveType === 'slow-2g' || conn.effectiveType === '2g';
}

/**
 * Background de vídeo do hero: 16:9 no desktop, 9:16 abaixo de 768px.
 * Autoplay muted em loop com poster (primeiro frame = breu, igual ao fundo).
 * Em conexões lentas (Save-Data / 2g) ou erro de reprodução, exibe a
 * imagem estática no lugar do vídeo.
 */
export default function HeroVideo() {
  const videoRef = useRef<HTMLVideoElement>(null);
  // null até o mount: evita mismatch de hidratação (viewport só existe no cliente)
  const [variant, setVariant] = useState<keyof typeof SOURCES | null>(null);
  const [useStatic, setUseStatic] = useState(false);

  useEffect(() => {
    if (prefersStaticImage()) {
      setUseStatic(true);
    }
    const mq = window.matchMedia(MOBILE_QUERY);
    const apply = () => setVariant(mq.matches ? 'mobile' : 'desktop');
    apply();
    mq.addEventListener('change', apply);
    return () => mq.removeEventListener('change', apply);
  }, []);

  // Troca de fonte exige load() explícito; autoplay pode ser bloqueado → fallback.
  useEffect(() => {
    const video = videoRef.current;
    if (!video || useStatic || !variant) return;
    video.load();
    const play = video.play();
    if (play) {
      play.catch((err: DOMException) => {
        // AbortError = load() concorrente (ex.: StrictMode) — transitório, ignora.
        if (err?.name === 'AbortError') return;
        setUseStatic(true); // NotAllowedError etc.: autoplay bloqueado de verdade
      });
    }
  }, [variant, useStatic]);

  if (!variant) {
    // Antes do mount: breu sólido, mesma cor do primeiro frame do vídeo.
    return <div className="absolute inset-0 bg-[#0A0A0C]" aria-hidden="true" />;
  }

  const src = SOURCES[variant];

  if (useStatic) {
    return (
      <div className="absolute inset-0" aria-hidden="true">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={src.fallback}
          alt=""
          className="absolute inset-0 h-full w-full object-cover"
        />
      </div>
    );
  }

  return (
    <div className="absolute inset-0" aria-hidden="true">
      <video
        ref={videoRef}
        key={variant}
        className="absolute inset-0 h-full w-full object-cover"
        autoPlay
        muted
        loop
        playsInline
        preload="auto"
        poster={src.poster}
        onError={() => setUseStatic(true)}
      >
        <source src={src.webm} type="video/webm" />
        {/* onError no último source: é nele que a spec dispara quando TODAS
            as fontes falham (o onError do <video> cobre erros de decode). */}
        <source src={src.mp4} type="video/mp4" onError={() => setUseStatic(true)} />
      </video>
    </div>
  );
}
