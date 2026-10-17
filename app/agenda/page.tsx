'use client';

import { useEffect, useMemo, useState } from 'react';
import EventCard from '@/components/EventCard';
import { DAY_LABELS, type DayKey } from '@/lib/events';
import { downloadIcs, generateIcsCalendar } from '@/lib/ics';
import type { Event } from '@/lib/types';

const DAY_ORDER: DayKey[] = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'];

function weekdayFromDate(date: string): DayKey {
  const d = new Date(`${date}T12:00:00Z`);
  const n = d.getUTCDay(); // 0=Sun
  const map: DayKey[] = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];
  return map[n];
}

function extractTags(events: Event[]) {
  const set = new Set<string>();
  for (const e of events) {
    for (const t of e.tags) set.add(t);
  }
  return Array.from(set).sort();
}

export default function AgendaPage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedTag, setSelectedTag] = useState<string>('all');
  const [selectedDay, setSelectedDay] = useState<DayKey | 'all'>('all');

  useEffect(() => {
    fetch('/api/events')
      .then((res) => res.json())
      .then((data) => {
        setEvents(data.events || []);
        setLoading(false);
      })
      .catch(() => {
        setError('Não foi possível carregar a agenda.');
        setLoading(false);
      });
  }, []);

  const tags = useMemo(() => extractTags(events), [events]);

  const filtered = useMemo(() => {
    return events.filter((e) => {
      const tagOk = selectedTag === 'all' || e.tags.includes(selectedTag);
      const dayOk = selectedDay === 'all' || weekdayFromDate(e.date) === selectedDay;
      return tagOk && dayOk;
    });
  }, [events, selectedTag, selectedDay]);

  const exportVisible = () => {
    if (filtered.length === 0) return;
    downloadIcs('campusnaut-agenda.ics', generateIcsCalendar(filtered));
  };

  return (
    <div className="py-8 md:py-12">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <span className="inline-block rounded-full border border-tomato bg-tomato/10 px-3 py-1 text-xs font-bold uppercase tracking-wide text-tomato-dark">
            Demo
          </span>
          <h1 className="mt-4 font-display text-4xl font-bold md:text-5xl">Agenda da semana</h1>
          <p className="mt-2 text-ink-muted">
            40 eventos fictícios de 19 a 25 de outubro de 2026. Fusorário: Los Angeles.
          </p>
        </div>
        <button
          type="button"
          onClick={exportVisible}
          disabled={filtered.length === 0}
          className="min-h-11 rounded-md border-2 border-ink bg-cream-100 px-4 py-2 text-sm font-semibold transition-colors hover:bg-tomato hover:text-white disabled:opacity-50"
        >
          Exportar visíveis
        </button>
      </div>

      <div className="mt-6 flex flex-col gap-4 rounded-xl border-2 border-ink bg-cream-50 p-4 sm:flex-row sm:items-end sm:p-5">
        <div className="flex-1">
          <label htmlFor="tag-filter" className="mb-1 block text-sm font-semibold">
            Tag
          </label>
          <select
            id="tag-filter"
            value={selectedTag}
            onChange={(e) => setSelectedTag(e.target.value)}
            className="min-h-11 w-full rounded-md border-2 border-ink bg-cream-50 px-3 text-sm focus:border-tomato focus:outline-none"
          >
            <option value="all">Todas</option>
            {tags.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </div>
        <div className="flex-1">
          <label htmlFor="day-filter" className="mb-1 block text-sm font-semibold">
            Dia
          </label>
          <select
            id="day-filter"
            value={selectedDay}
            onChange={(e) => setSelectedDay(e.target.value as DayKey | 'all')}
            className="min-h-11 w-full rounded-md border-2 border-ink bg-cream-50 px-3 text-sm focus:border-tomato focus:outline-none"
          >
            <option value="all">Todos</option>
            {DAY_ORDER.map((d) => (
              <option key={d} value={d}>
                {DAY_LABELS[d]}
              </option>
            ))}
          </select>
        </div>
      </div>

      {loading && (
        <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className="h-10 w-48 animate-pulse rounded bg-cream-200"
            />
          ))}
        </div>
      )}

      {error && (
        <div className="mt-8 rounded-xl border-2 border-tomato bg-tomato/10 p-6 text-tomato-dark">
          {error}
        </div>
      )}

      {!loading && !error && filtered.length === 0 && (
        <div className="mt-8 rounded-xl border-2 border-ink bg-cream-50 p-8 text-center shadow-poster">
          <p className="font-display text-xl font-bold">Nenhum evento com estes filtros.</p>
          <p className="mt-2 text-sm text-ink-muted">
            Tenta mudar o dia ou a tag.
          </p>
        </div>
      )}

      {!loading && filtered.length > 0 && (
        <>
          <p className="mt-4 text-sm text-ink-light">
            A mostrar {filtered.length} evento{filtered.length === 1 ? '' : 's'}
          </p>
          <div className="mt-4 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((event) => (
              <EventCard key={event.id} event={event} showExport />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
