import { AuthorityNumber } from '@/lib/types';

export default function Authority({ numbers }: { numbers: AuthorityNumber[] }) {
  const displayNumbers = numbers.length > 0 ? numbers : [
    { id: '1', artist_id: '', label: 'Anos de pista', value: '12+', sort_order: 0 },
    { id: '2', artist_id: '', label: 'BPM em rotação', value: '128', sort_order: 1 },
    { id: '3', artist_id: '', label: 'Cidades', value: '40+', sort_order: 2 },
    { id: '4', artist_id: '', label: 'Continentes', value: '3', sort_order: 3 },
  ];

  return (
    <section className="relative py-24 px-4 border-y border-white/5">
      <div className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8">
        {displayNumbers.map((n) => (
          <div key={n.id} className="text-center group">
            <span className="font-display text-5xl md:text-7xl font-bold text-blood block mb-2 group-hover:text-blood-light transition-colors">
              {n.value}
            </span>
            <span className="font-display text-xs tracking-[0.3em] uppercase text-cream-dim">
              {n.label}
            </span>
          </div>
        ))}
      </div>
    </section>
  );
}
