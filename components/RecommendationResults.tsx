'use client';

import { useMemo, useState } from 'react';
import EventCard from './EventCard';
import { getEventById } from '@/lib/events';
import { downloadIcs, generateIcsCalendar } from '@/lib/ics';
import type { ApiRecommendResponse, RecommendRequest } from '@/lib/schemas';

interface RecommendationResultsProps {
  response: ApiRecommendResponse;
  request: RecommendRequest;
  onRefine: (refine: string) => void;
  onReset: () => void;
  onRetry?: () => void;
}

function ModeBadge({ mode, model }: { mode: 'llm' | 'demo'; model?: string }) {
  if (mode === 'llm') {
    return (
      <span className="inline-flex items-center gap-2 rounded-full border border-lagoon-dark bg-lagoon/10 px-3 py-1 text-xs font-semibold text-lagoon-dark">
        <span className="h-2 w-2 rounded-full bg-lagoon" />
        {model || 'Assistente IA'}
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-2 rounded-full border border-tomato-dark bg-tomato/10 px-3 py-1 text-xs font-semibold text-tomato-dark">
      <span className="h-2 w-2 rounded-full bg-tomato" />
      Recomendação local
    </span>
  );
}

export default function RecommendationResults({
  response,
  onRefine,
  onReset,
  onRetry,
}: RecommendationResultsProps) {
  const [refine, setRefine] = useState('');
  const { picks, not_recommended, explanation } = response;

  const pickEvents = useMemo(
    () => picks.map((p) => ({ event: getEventById(p.event_id)!, pick: p })).filter((x) => x.event),
    [picks]
  );

  const notRecEvents = useMemo(
    () =>
      not_recommended
        .map((n) => ({ event: getEventById(n.event_id)!, reason: n.reason }))
        .filter((x) => x.event),
    [not_recommended]
  );

  const exportAll = () => {
    const events = pickEvents.map((x) => x.event);
    if (events.length === 0) return;
    downloadIcs('campusnaut-recomendacoes.ics', generateIcsCalendar(events));
  };

  if (pickEvents.length === 0) {
    return (
      <div className="animate-fade-in space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <ModeBadge mode={response.mode} model={response.model} />
          <button
            type="button"
            onClick={onReset}
            className="rounded-md border-2 border-ink bg-cream-100 px-4 py-2 text-sm font-semibold transition-colors hover:bg-tomato hover:text-white"
          >
            Recomeçar
          </button>
        </div>
        <div className="border-2 border-ink bg-cream-50 p-6 text-center shadow-poster">
          <h2 className="font-display text-2xl font-bold">Nenhum evento encaixa...</h2>
          <p className="mt-2 text-ink-muted">
            {explanation ||
              'Tenta alargar os interesses, escolher mais dias ou mudar a preferência de preço.'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="animate-fade-in space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <ModeBadge mode={response.mode} model={response.model} />
        <div className="flex flex-wrap gap-2">
          {pickEvents.length > 1 && (
            <button
              type="button"
              onClick={exportAll}
              className="rounded-md border-2 border-ink bg-cream-100 px-4 py-2 text-sm font-semibold transition-colors hover:bg-tomato hover:text-white"
            >
              Exportar seleção
            </button>
          )}
          <button
            type="button"
            onClick={onReset}
            className="rounded-md border-2 border-ink bg-cream-100 px-4 py-2 text-sm font-semibold transition-colors hover:bg-tomato hover:text-white"
          >
            Recomeçar
          </button>
        </div>
      </div>

      {response.warning && (
        <div className="flex flex-col gap-3 rounded-lg border-2 border-tomato bg-tomato/10 p-4 text-sm text-tomato-dark sm:flex-row sm:items-center sm:justify-between">
          <p className="leading-relaxed">
            <span className="font-semibold">Assistente temporariamente indisponível.</span>{' '}
            {response.warning}
          </p>
          {onRetry && (
            <button
              type="button"
              onClick={onRetry}
              className="shrink-0 rounded-md border-2 border-tomato-dark bg-cream-100 px-4 py-2 text-xs font-bold transition-colors hover:bg-tomato hover:text-white"
            >
              Tentar com IA
            </button>
          )}
        </div>
      )}

      <section aria-label="Recomendações">
        <h2 className="font-display text-2xl font-bold">Escolhidos para ti</h2>
        <div className="mt-4 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {pickEvents.map(({ event, pick }) => (
            <EventCard
              key={event.id}
              event={event}
              reason={pick.reason}
              fit={pick.fit}
              showExport
            />
          ))}
        </div>
      </section>

      <section className="rounded-xl border-2 border-ink bg-cream-50 p-4 sm:p-5">
        <h3 className="font-display text-lg font-bold">Refinar recomendações</h3>
        <p className="text-sm text-ink-muted">
          Adiciona contexto, por exemplo: &quot;só grátis&quot;, &quot;só à noite&quot; ou &quot;mais arte&quot;.
        </p>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (refine.trim()) {
              onRefine(refine.trim());
              setRefine('');
            }
          }}
          className="mt-3 flex flex-col gap-2 sm:flex-row"
        >
          <label htmlFor="refine" className="sr-only">
            Refinar
          </label>
          <input
            id="refine"
            type="text"
            value={refine}
            onChange={(e) => setRefine(e.target.value)}
            placeholder="ex.: só grátis, só à noite..."
            maxLength={300}
            className="min-h-11 flex-1 rounded-md border-2 border-ink px-3 text-sm focus:border-tomato focus:outline-none"
          />
          <button
            type="submit"
            disabled={!refine.trim()}
            className="min-h-11 rounded-md border-2 border-ink bg-ink px-5 text-sm font-semibold text-cream-50 transition-colors hover:bg-tomato disabled:opacity-50"
          >
            Refinar
          </button>
        </form>
      </section>

      {notRecEvents.length > 0 && (
        <details className="group rounded-xl border-2 border-ink bg-cream-50">
          <summary className="flex cursor-pointer list-none items-center justify-between p-4 font-display font-bold sm:p-5">
            <span>Não recomendados ({notRecEvents.length})</span>
            <span className="text-xl transition-transform group-open:rotate-180">▾</span>
          </summary>
          <div className="border-t-2 border-ink/10 p-4 sm:p-5">
            <ul className="space-y-4">
              {notRecEvents.map(({ event, reason }) => (
                <li key={event.id} className="border-b border-ink/10 pb-4 last:border-0 last:pb-0">
                  <p className="font-semibold">
                    {event.title}{' '}
                    <span className="text-sm font-normal text-ink-light">
                      ({event.start}–{event.end})
                    </span>
                  </p>
                  <p className="mt-1 text-sm text-ink-muted">{reason}</p>
                </li>
              ))}
            </ul>
          </div>
        </details>
      )}
    </div>
  );
}
