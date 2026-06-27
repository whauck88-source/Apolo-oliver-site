import { createServerSupabase } from '@/lib/supabase/server';
import Hero from '@/components/vitrine/Hero';
import Manifesto from '@/components/vitrine/Manifesto';
import Authority from '@/components/vitrine/Authority';
import Catalog from '@/components/vitrine/Catalog';
import Schedule from '@/components/vitrine/Schedule';
import EPK from '@/components/vitrine/EPK';
import Booking from '@/components/vitrine/Booking';
import Footer from '@/components/vitrine/Footer';

export const revalidate = 60;

async function getArtistData() {
  const supabase = createServerSupabase();
  const { data: artist } = await supabase
    .from('artists')
    .select('*')
    .eq('slug', 'apolo-oliver')
    .single();

  if (!artist) return null;

  const [contentRes, scheduleRes, authorityRes] = await Promise.all([
    supabase.from('content_blocks').select('*').eq('artist_id', artist.id).order('sort_order'),
    supabase.from('schedule_events').select('*').eq('artist_id', artist.id).eq('is_published', true).gte('event_date', new Date().toISOString().split('T')[0]).order('event_date'),
    supabase.from('authority_numbers').select('*').eq('artist_id', artist.id).order('sort_order'),
  ]);

  return {
    artist,
    content: contentRes.data || [],
    schedule: scheduleRes.data || [],
    authority: authorityRes.data || [],
  };
}

export default async function HomePage() {
  const data = await getArtistData();
  if (!data) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-cream-dim text-lg">Configurando site...</p>
      </div>
    );
  }

  const { artist, content, schedule, authority } = data;
  const getContent = (section: string, key: string) =>
    content.find((c: any) => c.section === section && c.key === key)?.value || '';

  return (
    <main>
      <Hero artist={artist} subtitle={getContent('hero', 'subtitle')} />
      <Manifesto text={getContent('manifesto', 'text')} />
      <Authority numbers={authority} />
      <Catalog
        spotifyEmbed={getContent('catalog', 'spotify_embed')}
        soundcloudEmbed={getContent('catalog', 'soundcloud_embed')}
      />
      <Schedule events={schedule} />
      <EPK epkUrl={artist.epk_url} />
      <Booking email={artist.booking_email} whatsapp={artist.booking_whatsapp} />
      <Footer artist={artist} />
    </main>
  );
}
