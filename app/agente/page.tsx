'use client';

import { useState } from 'react';
import InterestPicker from '@/components/InterestPicker';
import AvailabilityPicker from '@/components/AvailabilityPicker';
import RecommendationResults from '@/components/RecommendationResults';
import SkeletonCard from '@/components/SkeletonCard';
import { recommendRequestSchema, type RecommendRequest, type ApiRecommendResponse } from '@/lib/schemas';
import type { DayKey } from '@/lib/events';

export default function AgentPage() {
  const [interests, setInterests] = useState<string[]>([]);
  const [days, setDays] = useState<DayKey[]>(['mon', 'tue', 'wed', 'thu', 'fri']);
  const [freeTimes, setFreeTimes] = useState('');
  const [price, setPrice] = useState<'free' | 'any'>('any');
  const [refine, setRefine] = useState('');

  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [response, setResponse] = useState<ApiRecommendResponse | null>(null);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [errorMessage, setErrorMessage] = useState('');

  const buildRequest = (extraRefine?: string): RecommendRequest => {
    const req: RecommendRequest = {
      interests,
      availability: { days, freeTimes: freeTimes.trim() || undefined },
      price,
      refine: extraRefine ? refine || extraRefine : refine || undefined,
    };
    if (extraRefine) req.refine = extraRefine;
    return req;
  };

  const submit = async (extraRefine?: string) => {
    setValidationErrors({});
    const req = buildRequest(extraRefine);
    const parsed = recommendRequestSchema.safeParse(req);
    if (!parsed.success) {
      const map: Record<string, string> = {};
      for (const issue of parsed.error.issues) {
        const key = issue.path.length > 0 ? issue.path.join('.') : 'global';
        map[key] = issue.message;
      }
      setValidationErrors(map);
      return;
    }

    setStatus('loading');
    setErrorMessage('');

    try {
      const res = await fetch('/api/recommend', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(req),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) {
        throw new Error(data.errors?.[0] || 'Erro ao obter recomendações.');
      }
      setResponse(data as ApiRecommendResponse);
      setStatus('success');
    } catch (err) {
      setStatus('error');
      setErrorMessage(err instanceof Error ? err.message : 'Erro de ligação.');
    }
  };

  const handleRefine = (text: string) => {
    setRefine(text);
    submit(text);
  };

  const handleReset = () => {
    setInterests([]);
    setDays(['mon', 'tue', 'wed', 'thu', 'fri']);
    setFreeTimes('');
    setPrice('any');
    setRefine('');
    setResponse(null);
    setStatus('idle');
    setValidationErrors({});
    setErrorMessage('');
  };

  return (
    <div className="py-8 md:py-12">
      <div className="max-w-3xl">
        <span className="inline-block rounded-full border border-tomato bg-tomato/10 px-3 py-1 text-xs font-bold uppercase tracking-wide text-tomato-dark">
          Demo
        </span>
        <h1 className="mt-4 font-display text-4xl font-bold md:text-5xl">O agente CampusPulse</h1>
        <p className="mt-3 text-ink-muted">
          Diz-nos o que gostas e quando estás livre. Vamos sugerir 3 a 5 eventos da semana com uma
          razão personalizada para cada um.
        </p>
      </div>

      {status !== 'idle' && status !== 'loading' && response && (
        <div className="mt-10">
          <RecommendationResults
            response={response}
            request={buildRequest()}
            onRefine={handleRefine}
            onReset={handleReset}
          />
        </div>
      )}

      {status === 'loading' && (
        <div className="mt-10" aria-live="polite">
          <p className="font-display text-xl font-bold">A analisar a agenda...</p>
          <div className="mt-5 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
          </div>
        </div>
      )}

      {status === 'error' && (
        <div className="mt-10 rounded-xl border-2 border-tomato bg-tomato/10 p-6">
          <h2 className="font-display text-xl font-bold text-tomato-dark">Algo correu mal</h2>
          <p className="mt-1 text-sm text-tomato-dark">{errorMessage}</p>
          <button
            type="button"
            onClick={() => submit()}
            className="mt-4 min-h-11 rounded-md border-2 border-ink bg-cream-100 px-5 text-sm font-semibold transition-colors hover:bg-tomato hover:text-white"
          >
            Tentar de novo
          </button>
        </div>
      )}

      {(status === 'idle' || status === 'loading') && (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            submit();
          }}
          className="mt-8 space-y-8"
        >
          <div className="rounded-xl border-2 border-ink bg-cream-50 p-5 sm:p-6">
            <InterestPicker
              value={interests}
              onChange={setInterests}
              error={validationErrors['interests']}
            />
          </div>

          <div className="rounded-xl border-2 border-ink bg-cream-50 p-5 sm:p-6">
            <AvailabilityPicker
              days={days}
              onDaysChange={setDays}
              freeTimes={freeTimes}
              onFreeTimesChange={setFreeTimes}
              daysError={validationErrors['availability.days']}
            />
          </div>

          <fieldset className="rounded-xl border-2 border-ink bg-cream-50 p-5 sm:p-6">
            <legend className="font-display text-lg font-bold">Preço</legend>
            <div className="mt-3 flex flex-wrap gap-4">
              <label className="inline-flex min-h-11 cursor-pointer items-center gap-3 rounded-lg border-2 border-ink bg-cream-100 px-4 py-2">
                <input
                  type="radio"
                  name="price"
                  value="free"
                  checked={price === 'free'}
                  onChange={() => setPrice('free')}
                  className="h-5 w-5 accent-tomato"
                />
                <span className="text-sm font-semibold">Só eventos grátis</span>
              </label>
              <label className="inline-flex min-h-11 cursor-pointer items-center gap-3 rounded-lg border-2 border-ink bg-cream-100 px-4 py-2">
                <input
                  type="radio"
                  name="price"
                  value="any"
                  checked={price === 'any'}
                  onChange={() => setPrice('any')}
                  className="h-5 w-5 accent-tomato"
                />
                <span className="text-sm font-semibold">Qualquer preço</span>
              </label>
            </div>
          </fieldset>

          {validationErrors['global'] && (
            <p className="text-sm font-medium text-tomato">{validationErrors['global']}</p>
          )}

          <button
            type="submit"
            disabled={status === 'loading'}
            className="w-full min-h-14 rounded-md border-2 border-ink bg-tomato px-6 py-3 font-display text-lg font-bold text-white shadow-poster transition-transform hover:-translate-x-0.5 hover:-translate-y-0.5 disabled:opacity-60 sm:w-auto"
          >
            {status === 'loading' ? 'A pesquisar...' : 'Encontrar eventos'}
          </button>
        </form>
      )}
    </div>
  );
}
