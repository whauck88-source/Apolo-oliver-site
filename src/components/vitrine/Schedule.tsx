import { ScheduleEvent } from '@/lib/types';

export default function Schedule({ events }: { events: ScheduleEvent[] }) {
  return (
    <section id="agenda" className="relative py-24 px-4 bg-white/[0.02]">
      <div className="max-w-4xl mx-auto">
        <span className="font-display text-xs tracking-[0.5em] uppercase text-blood mb-4 block text-center">Next Shows</span>
        <h2 className="font-display text-4xl md:text-6xl font-bold uppercase text-center mb-16 tracking-tight">Agenda</h2>
        {events.length === 0 ? (
          <p className="text-center text-cream-dim font-body">Novas datas em breve. Fique ligado.</p>
        ) : (
          <div className="space-y-0">
            {events.map((event, i) => {
              const date = new Date(event.event_date + 'T00:00:00');
              const day = date.getDate().toString().padStart(2, '0');
              const month = date.toLocaleDateString('pt-BR', { month: 'short' }).toUpperCase().replace('.', '');
              return (
                <div key={event.id} className="flex items-center gap-6 py-6 border-b border-white/5 group hover:bg-white/[0.02] transition-colors px-4 -mx-4">
                  <div className="text-center min-w-[60px]">
                    <span className="font-display text-3xl font-bold text-blood block leading-none">{day}</span>
                    <span className="font-display text-xs tracking-widest text-cream-dim">{month}</span>
                  </div>
                  <div className="flex-1">
                    <h3 className="font-display text-lg uppercase tracking-wide">{event.event_name}</h3>
                    <p className="text-cream-dim text-sm">{event.venue} — {event.city}, {event.country}</p>
                  </div>
                  {event.ticket_url && (
                    <a href={event.ticket_url} target="_blank" rel="noopener noreferrer"
                      className="px-6 py-2 border border-blood text-blood hover:bg-blood hover:text-white font-display text-xs uppercase tracking-widest transition-all">
                      Ingressos
                    </a>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
