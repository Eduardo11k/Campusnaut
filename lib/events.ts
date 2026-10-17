import eventsData from '@/data/events.json';
import { CAMPUS_TZ } from './time';
import type { DayKey, Event } from './types';

export type { DayKey };

const rawEvents = eventsData as Event[];

export const DAY_LABELS: Record<DayKey, string> = {
  mon: 'Segunda',
  tue: 'Terça',
  wed: 'Quarta',
  thu: 'Quinta',
  fri: 'Sexta',
  sat: 'Sábado',
  sun: 'Domingo',
};

const DAY_ORDER: DayKey[] = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'];

export function dayKeyForDate(dateStr: string): DayKey {
  const label = new Intl.DateTimeFormat('pt-BR', {
    timeZone: CAMPUS_TZ,
    weekday: 'long',
  }).format(new Date(`${dateStr}T12:00:00`));
  const normalized = label.toLowerCase();
  for (const key of DAY_ORDER) {
    if (normalized.includes(DAY_LABELS[key].toLowerCase())) {
      return key;
    }
  }
  return 'mon';
}

const eventDayMap = new Map<string, DayKey>();
for (const event of rawEvents) {
  eventDayMap.set(event.id, dayKeyForDate(event.date));
}

export function getAllEvents(): Event[] {
  return rawEvents;
}

export function getEventById(id: string): Event | undefined {
  return rawEvents.find((e) => e.id === id);
}

export function getEventsByDay(day: DayKey): Event[] {
  return rawEvents.filter((e) => eventDayMap.get(e.id) === day);
}

export function filterEventsByDays(days?: DayKey[]): Event[] {
  if (!days || days.length === 0) return rawEvents;
  const set = new Set(days);
  return rawEvents.filter((e) => set.has(eventDayMap.get(e.id)!));
}

export function getEventDay(event: Event): DayKey {
  return eventDayMap.get(event.id) ?? dayKeyForDate(event.date);
}

export const TAGS = [
  'IA',
  'startups',
  'desporto',
  'arte',
  'música',
  'carreira',
  'voluntariado',
  'jogos',
  'saúde',
  'programação',
];
