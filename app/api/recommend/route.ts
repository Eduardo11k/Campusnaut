import { NextResponse } from 'next/server';
import { recommendRequestSchema } from '@/lib/schemas';
import { filterEventsByDays, getAllEvents } from '@/lib/events';
import {
  callLLM,
  getModelName,
  isLLMAvailable,
  runDemoScoring,
  validateAndFilter,
} from '@/lib/recommend';
import { getEventById } from '@/lib/events';
import type { Event } from '@/lib/types';

export const dynamic = 'force-dynamic';
export const maxDuration = 10;

function hasConflicts(pickIds: string[]) {
  const events: Event[] = [];
  for (const id of pickIds) {
    const event = getEventById(id);
    if (!event) continue;
    for (const existing of events) {
      const aStart = new Date(`${event.date}T${event.start}:00Z`);
      const aEnd = new Date(`${event.date}T${event.end}:00Z`);
      const bStart = new Date(`${existing.date}T${existing.start}:00Z`);
      const bEnd = new Date(`${existing.date}T${existing.end}:00Z`);
      if (aStart < bEnd && bStart < aEnd) return true;
    }
    events.push(event);
  }
  return false;
}

export async function POST(req: Request) {
  const json = await req.json().catch(() => ({}));
  const parsed = recommendRequestSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json(
      { ok: false, errors: parsed.error.issues.map((i) => i.message) },
      { status: 400 }
    );
  }

  const body = parsed.data;
  const allEvents = getAllEvents();
  const validIds = new Set(allEvents.map((e) => e.id));
  const filtered = filterEventsByDays(body.availability.days);

  let mode: 'llm' | 'demo' = 'demo';
  let model = getModelName();
  let warning: string | undefined;
  let result = runDemoScoring(filtered, body);

  if (isLLMAvailable()) {
    try {
      const llmResult = await callLLM(filtered, body);
      const validated = validateAndFilter(llmResult, validIds);
      if (validated.picks.length > 0 && !hasConflicts(validated.picks.map((p) => p.event_id))) {
        result = validated;
        mode = 'llm';
      } else if (filtered.length === 0 && validated.picks.length === 0) {
        result = validated;
        mode = 'llm';
      } else {
        throw new Error('Resposta do modelo vazia, conflituosa ou com IDs inválidos.');
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      console.warn('CampusPulse: LLM falhou, a usar demo.', message);
      result = runDemoScoring(filtered, body);
      mode = 'demo';
      warning = `O modelo não respondeu como esperado. A mostrar recomendações locais.`;
    }
  } else {
    warning = 'Modo demo: nenhuma chave de API configurada.';
  }

  return NextResponse.json({
    ok: true,
    mode,
    model,
    warning,
    picks: result.picks,
    not_recommended: result.not_recommended,
    explanation: result.explanation,
  });
}
