export interface Artist {
  id: string;
  slug: string;
  name: string;
  tagline: string;
  bio: string;
  epk_url: string | null;
  booking_email: string;
  booking_whatsapp: string | null;
  spotify_url: string | null;
  soundcloud_url: string | null;
  instagram_url: string | null;
  youtube_url: string | null;
  tiktok_url: string | null;
  hero_image_url: string | null;
  created_at: string;
}

export interface ContentBlock {
  id: string;
  artist_id: string;
  section: string;
  key: string;
  value: string;
  sort_order: number;
}

export interface ScheduleEvent {
  id: string;
  artist_id: string;
  event_name: string;
  venue: string;
  city: string;
  country: string;
  event_date: string;
  ticket_url: string | null;
  is_published: boolean;
}

export interface Product {
  id: string;
  artist_id: string;
  name: string;
  description: string;
  price_cents: number;
  currency: string;
  product_type: 'track' | 'pack';
  file_path: string;
  cover_image_url: string | null;
  is_active: boolean;
  created_at: string;
}

export interface Order {
  id: string;
  product_id: string;
  customer_email: string;
  amount_cents: number;
  currency: string;
  stripe_session_id: string;
  stripe_payment_intent: string | null;
  status: 'pending' | 'paid' | 'failed' | 'refunded';
  download_token: string;
  download_count: number;
  max_downloads: number;
  token_expires_at: string;
  created_at: string;
  product?: Product;
}

export interface AuthorityNumber {
  id: string;
  artist_id: string;
  label: string;
  value: string;
  sort_order: number;
}
