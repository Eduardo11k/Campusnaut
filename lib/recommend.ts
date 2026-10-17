'use server';

import { z } from 'zod';
import { getEventById } from './events';
import { eventDurationMinutes, parseEventZonedDate } from './time';
import {
  pickSchema,
  notRecommendedSchema,
  recommendationResponseSchema,
  type RecommendRequest,
} from './schemas';
import type { Event, Pick, NotRecommended, RecommendationOutput } from './types';

const LLM_API_KEY = process.env.LLM_API_KEY;
const LLM_BASE_URL = process.env.LLM_BASE_URL ?? 'https://api.featherless.ai/v1';
const LLM_MODEL = process.env.LLM_MODEL ?? 'Qwen/Qwen3-32B';

export function isLLMAvailable() {
  return Boolean(LLM_API_KEY && LLM_API_KEY.startsWith('sk-'));
}

export function getModelName() {
  return LLM_MODEL;
}

export function extractFirstJson(text: string): unknown {
  let firstBrace = text.indexOf('{');
  while (firstBrace !== -1) {
    let depth = 0;
    for (let i = firstBrace; i < text.length; i++) {
      if (text[i] === '{') depth++;
      else if (text[i] === '}') depth--;
      if (depth === 0) {
        try {
          return JSON.parse(text.slice(firstBrace, i + 1));
        } catch {
          break;
        }
      }
    }
    firstBrace = text.indexOf('{', firstBrace + 1);
  }
  throw new Error('Nenhum bloco JSON válido encontrado.');
}

function formatEventsForPrompt(events: Event[]) {
  return events.map((e) => ({
    id: e.id,
    title: e.title,
    description: e.description.slice(0, 160),
    date: e.date,
    start: e.start,
    end: e.end,
    location: e.location,
    tags: e.tags,
    price: e.price === 0 ? 'grátis' : `$${e.price}`,
  }));
}

function buildSystemPrompt(): string {
  return `És o CampusPulse, um agente de recomendação de eventos universitários em Los Angeles.

REGRAS OBRIGATÓRIAS:
1. Recebes a lista de eventos já filtrada pelos dias disponíveis do estudante.
2. Devolve APENAS um objeto JSON válido, sem Markdown nem explicações fora do JSON.
3. O formato exacto é:
{
  "picks": [
    {"event_id": "evt-001", "reason": "razão concreta citando algo específico da descrição do evento", "fit": 0.92}
  ],
  "not_recommended": [
    {"event_id": "evt-005", "reason": "razão concreta citando algo específico da descrição do evento"}
  ],
  "explanation": "opcional"
}
4. fit é entre 0 e 1.
5. Recomenda 3 a 5 eventos. Nunca mais de 5.
6. As razões DEVEM citar algo concreto da descrição do evento. Frases genéricas são proibidas.
7. Não recomendes eventos com sobreposição de horário.
8. Se nada encaixar, devolve picks vazio e uma explicação curta.`;
}

function buildUserPrompt(events: Event[], input: RecommendRequest): string {
  const days = input.availability.days.join(', ');
  const data = formatEventsForPrompt(events);
  const lines = [
    'Perfil do estudante:',
    `Interesses: ${input.interests.join(', ')}`,
    `Dias livres: ${days}`,
    `Horas livres: ${input.availability.freeTimes || 'não especificado'}`,
    `Preço: ${input.price === 'free' ? 'só eventos grátis' : 'qualquer preço'}`,
  ];
  if (input.refine) lines.push(`Refinamento do pedido: ${input.refine}`);
  lines.push('', 'Eventos disponíveis (JSON):', JSON.stringify(data, null, 2));
  return lines.join('\n');
}

export async function callLLM(
  events: Event[],
  input: RecommendRequest
): Promise<RecommendationOutput> {
  if (!isLLMAvailable()) {
    throw new Error('Chave de API não configurada.');
  }

  const url = `${LLM_BASE_URL.replace(/\/$/, '')}/chat/completions`;
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 8000);

  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${LLM_API_KEY}`,
      },
      body: JSON.stringify({
        model: LLM_MODEL,
        temperature: 0.15,
        max_tokens: 2500,
        messages: [
          { role: 'system', content: buildSystemPrompt() },
          { role: 'user', content: buildUserPrompt(events, input) },
        ],
      }),
      signal: controller.signal,
    });

    if (!res.ok) {
      const body = await res.text().catch(() => '');
      throw new Error(`LLM HTTP ${res.status}: ${body.slice(0, 200)}`);
    }

    const raw = await res.text();
    const parsed = JSON.parse(raw);
    const message = parsed?.choices?.[0]?.message ?? {};
    const content =
      (message.content || message.reasoning)?.toString() ?? '';
    const json = extractFirstJson(content);
    return recommendationResponseSchema.parse(json);
  } finally {
    clearTimeout(timeout);
  }
}

function normalize(text: string) {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
}

function hourOfStart(event: Event) {
  return parseEventZonedDate(event).start.getUTCHours();
}

function periodOf(hour: number): ('morning' | 'afternoon' | 'evening')[] {
  const out: ('morning' | 'afternoon' | 'evening')[] = [];
  if (hour >= 6 && hour < 12) out.push('morning');
  if (hour >= 12 && hour < 18) out.push('afternoon');
  if (hour >= 18 || hour < 6) out.push('evening');
  return out;
}

function periodPreferences(text?: string): ('morning' | 'afternoon' | 'evening')[] {
  const t = normalize(text ?? '');
  const map: Record<string, ('morning' | 'afternoon' | 'evening')[]> = {
    manha: ['morning'],
    manhã: ['morning'],
    tarde: ['afternoon'],
    noite: ['evening'],
    'depois das': ['afternoon', 'evening'],
    'a noite': ['evening'],
    'fim de tarde': ['afternoon', 'evening'],
  };
  const result: ('morning' | 'afternoon' | 'evening')[] = [];
  for (const [k, v] of Object.entries(map)) {
    if (t.includes(k)) result.push(...v);
  }
  return Array.from(new Set(result));
}

function scoreEvent(event: Event, input: RecommendRequest): number {
  let score = 0;
  const interests = input.interests.map((i) => normalize(i));
  const desc = normalize(event.description);
  const title = normalize(event.title);
  const tags = event.tags.map((t) => normalize(t));

  for (const interest of interests) {
    if (tags.includes(interest)) score += 35;
    else if (title.includes(interest)) score += 25;
    else if (desc.includes(interest)) score += 18;
  }

  for (const tag of tags) {
    if (interests.some((i) => i.includes(tag) || tag.includes(i))) score += 12;
  }

  const hour = hourOfStart(event);
  const periods = periodOf(hour);
  const preferred = periodPreferences(input.availability.freeTimes);
  if (preferred.length > 0) {
    if (periods.some((p) => preferred.includes(p))) score += 22;
    else score -= 10;
  }

  const refine = normalize(input.refine ?? '');
  if (refine) {
    if (refine.includes('gratis') || refine.includes('gratuito') || refine.includes('free')) {
      if (event.price > 0) score -= 200;
      else score += 30;
    }
    if (refine.includes('noite') || refine.includes('tarde') || refine.includes('manha') || refine.includes('manhã')) {
      const pref2 = periodPreferences(input.refine);
      if (periods.some((p) => pref2.includes(p))) score += 22;
      else score -= 15;
    }
    for (const interest of interests) {
      if (refine.includes(interest)) {
        if (tags.includes(interest) || title.includes(interest) || desc.includes(interest)) {
          score += 20;
        }
      }
    }
  }

  if (input.price === 'free' && event.price > 0) score -= 250;
  return score;
}

function eventsOverlap(a: Event, b: Event) {
  const aa = parseEventZonedDate(a);
  const bb = parseEventZonedDate(b);
  return aa.start < bb.end && bb.start < aa.end;
}

function concreteSnippet(event: Event): string {
  const sentences = event.description.split(/(?<=[.!?])\s+/).filter(Boolean);
  const first = sentences[0] ?? event.description;
  return first.length > 140 ? first.slice(0, 137) + '...' : first;
}

function buildDemoReason(event: Event, input: RecommendRequest): string {
  const snippet = concreteSnippet(event);
  const priceText = event.price === 0 ? 'É grátis.' : `Custa $${event.price}.`;
  const top = normalize(input.interests[0]);
  const focused =
    normalize(event.tags.join(' ')).includes(top) ||
    normalize(event.title).includes(top) ||
    normalize(event.description).includes(top);
  if (!focused) {
    return `A descrição menciona "${snippet}" — podes encontrar pontos de contacto com ${input.interests[0]} e explorar uma área nova. ${priceText}`;
  }
  return `A descrição diz "${snippet}", o que encaixa diretamente no teu interesse em ${input.interests[0]}. ${priceText}`;
}

function buildNotRecommendedReason(
  event: Event,
  recommended: Event[],
  input: RecommendRequest,
  score: number
): string {
  const conflicting = recommended.find((r) => r.id !== event.id && eventsOverlap(event, r));
  const snippet = concreteSnippet(event);
  if (conflicting) {
    return `Conflita no horário com "${conflicting.title}" (${conflicting.start}–${conflicting.end}). Além disso, a descrição refere "${snippet}".`;
  }
  if (input.price === 'free' && event.price > 0) {
    return `Só estás a considerar eventos grátis e este custa $${event.price}. A descrição indica "${snippet}".`;
  }
  if (score < -80) {
    return `A descrição foca em "${snippet}", que não reflete os interesses que indicaste. Também o horário afasta-se das tuas preferências.`;
  }
  return `A descrição diz "${snippet}", mas existem eventos mais alinhados com os teus interesses e horários livres.`;
}

export function runDemoScoring(events: Event[], input: RecommendRequest): RecommendationOutput {
  const scored = events.map((event) => ({ event, score: scoreEvent(event, input) }));
  const minScore = Math.min(...scored.map((s) => s.score), 0);
  const maxScore = Math.max(...scored.map((s) => s.score), 1);

  const withFit = scored.map(({ event, score }) => ({
    event,
    score,
    fit: maxScore === minScore ? 0.5 : Math.min(1, Math.max(0, (score - minScore) / (maxScore - minScore))),
  }));

  const sorted = [...withFit].sort((a, b) => b.fit - a.fit);
  const picks: Pick[] = [];
  const recommendedEvents: Event[] = [];
  for (const item of sorted) {
    if (recommendedEvents.some((r) => eventsOverlap(item.event, r))) continue;
    if (picks.length >= 5) break;
    picks.push({
      event_id: item.event.id,
      reason: buildDemoReason(item.event, input),
      fit: Math.round(item.fit * 100) / 100,
    });
    recommendedEvents.push(item.event);
  }

  const not_recommended: NotRecommended[] = withFit
    .filter((item) => !recommendedEvents.some((r) => r.id === item.event.id))
    .map((item) => ({
      event_id: item.event.id,
      reason: buildNotRecommendedReason(item.event, recommendedEvents, input, item.score),
    }));

  return {
    picks,
    not_recommended,
    explanation:
      picks.length === 0
        ? 'Não conseguimos encontrar eventos que encaixem bem no teu perfil. Tenta alargar os interesses ou os dias disponíveis.'
        : undefined,
  };
}

export function validateAndFilter(
  raw: RecommendationOutput,
  validEventIds: Set<string>
): RecommendationOutput {
  const picks: Pick[] = [];
  const seen = new Set<string>();
  for (const p of raw.picks) {
    const safe = pickSchema.safeParse(p);
    if (!safe.success || !validEventIds.has(p.event_id)) {
      console.warn('CampusPulse: pick inválido descartado', p, safe.success ? 'ID desconhecido' : safe.error);
      continue;
    }
    if (seen.has(p.event_id)) continue;
    seen.add(p.event_id);
    picks.push(p);
  }

  const not_recommended: NotRecommended[] = [];
  const seenNot = new Set<string>();
  for (const n of raw.not_recommended) {
    const safe = notRecommendedSchema.safeParse(n);
    if (!safe.success || !validEventIds.has(n.event_id)) {
      console.warn('CampusPulse: not_recommended inválido descartado', n);
      continue;
    }
    if (seenNot.has(n.event_id)) continue;
    seenNot.add(n.event_id);
    not_recommended.push(n);
  }

  return { ...raw, picks, not_recommended };
}
