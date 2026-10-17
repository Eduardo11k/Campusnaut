'use client';

import FitMeter from './FitMeter';
import { generateIcsEvent, downloadIcs } from '@/lib/ics';
import { formatEventRange } from '@/lib/time';
import type { Event } from '@/lib/types';

interface EventCardProps {
  event: Event;
  reason?: string;
  fit?: number;
  showExport?: boolean;
}

function priceText(price: number) {
  return price === 0 ? 'Grátis' : `$${price}`;
}

export default function EventCard({ event, reason, fit, showExport = true }: EventCardProps) {
  return (
    <article className="poster-card flex h-full flex-col rounded-lg p-4 sm:p-5">
      <div className="mb-3 flex flex-wrap gap-2">
        {event.tags.map((tag) => (
          <span
            key={tag}
            className="rounded-full border border-ink bg-cream-100 px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wide text-ink"
          >
            {tag}
          </span>
        ))}
      </div>
      <h3 className="font-display text-xl font-bold leading-tight sm:text-2xl">{event.title}</h3>
      <p className="mt-2 text-sm font-medium text-ink-muted">{formatEventRange(event)}</p>
      <p className="mt-1 text-sm text-ink-muted">{event.location}</p>
      {typeof fit === 'number' && (
        <div className="mt-4">
          <FitMeter fit={fit} />
        </div>
      )}
      {reason && <p className="mt-3 border-l-4 border-tomato pl-3 text-sm leading-relaxed">{reason}</p>}
      <p className="mt-3 line-clamp-3 text-sm leading-relaxed text-ink-muted">{event.description}</p>
      <div className="mt-auto flex items-center justify-between border-t-2 border-ink/10 pt-4">
        <span className="font-display text-lg font-bold text-tomato">{priceText(event.price)}</span>
        {showExport && (
          <button
            type="button"
            onClick={() => downloadIcs(`campuspulse-${event.id}.ics`, generateIcsEvent(event))}
            className="rounded-md border-2 border-ink bg-cream-100 px-3 py-2 text-sm font-semibold text-ink transition-colors hover:bg-tomato hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-tomato"
            aria-label={`Adicionar ${event.title} ao calendário`}
          >
            Calendário
          </button>
        )}
      </div>
    </article>
  );
}
