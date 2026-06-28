import { Artist } from '@/lib/types';
import Link from 'next/link';

const SocialIcon = ({ url, label }: { url: string; label: string }) => (
  <a href={url} target="_blank" rel="noopener noreferrer"
    className="w-10 h-10 border border-white/10 hover:border-blood flex items-center justify-center text-cream-dim hover:text-blood transition-all text-xs font-display uppercase tracking-wider">
    {label.slice(0, 2)}
  </a>
);

export default function Footer({ artist }: { artist: Artist }) {
  const socials = [
    { url: artist.instagram_url, label: 'Instagram' },
    { url: artist.spotify_url, label: 'Spotify' },
    { url: artist.soundcloud_url, label: 'SoundCloud' },
    { url: artist.youtube_url, label: 'YouTube' },
    { url: artist.tiktok_url, label: 'TikTok' },
    { url: artist.beatport_url, label: 'Beatport' },
  ].filter((s) => s.url);

  return (
    <footer className="py-16 px-4 border-t border-white/5">
      <div className="max-w-5xl mx-auto">
        <div className="flex flex-col md:flex-row items-center justify-between gap-8">
          <div>
            <h3 className="font-display text-2xl font-bold uppercase tracking-tight">{artist.name}</h3>
            <p className="text-cream-dim text-sm mt-1">{artist.tagline}</p>
          </div>
          <div className="flex gap-3">
            {socials.map((s) => (
              <SocialIcon key={s.label} url={s.url!} label={s.label} />
            ))}
          </div>
        </div>
        <div className="mt-12 pt-8 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-cream-dim/40">
          <p>&copy; {new Date().getFullYear()} {artist.name}. Todos os direitos reservados.</p>
          <div className="flex gap-6">
            <Link href="/loja" className="hover:text-cream transition-colors">Loja</Link>
            <a href="#agenda" className="hover:text-cream transition-colors">Agenda</a>
            <a href="#booking" className="hover:text-cream transition-colors">Booking</a>
          </div>
          <p>Powered by <span className="text-cream-dim/60">HAUCK.CO</span></p>
        </div>
      </div>
    </footer>
  );
}
