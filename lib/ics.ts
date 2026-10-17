import { parseEventZonedDate, icsDateTime } from './time';
import type { Event } from './types';

export const CAMPUS_TZ = 'America/Los_Angeles';

function uidFor(event: Event) {
  return `campusnaut-${event.id}@campusnaut.local`;
}

function escapeIcs(text: string) {
  return text
    .replace(/\\/g, '\\\\')
    .replace(/;/g, '\\;')
    .replace(/,/g, '\\,')
    .replace(/\n/g, '\\n');
}

function wrapLine(line: string) {
  if (line.length <= 74) return line;
  const parts: string[] = [];
  let i = 0;
  while (i < line.length) {
    const chunk = line.slice(i, i + 74);
    parts.push(i === 0 ? chunk : ' ' + chunk);
    i += 74;
  }
  return parts.join('\r\n');
}

function eventBlock(event: Event): string {
  const { start, end } = parseEventZonedDate(event);
  const lines = [
    'BEGIN:VEVENT',
    `UID:${uidFor(event)}`,
    `DTSTAMP:${icsDateTime(new Date())}Z`,
    `DTSTART;TZID=${CAMPUS_TZ}:${icsDateTime(start)}`,
    `DTEND;TZID=${CAMPUS_TZ}:${icsDateTime(end)}`,
    `SUMMARY:${escapeIcs(event.title)}`,
    `DESCRIPTION:${escapeIcs(event.description)}`,
    `LOCATION:${escapeIcs(event.location)}`,
    'END:VEVENT',
  ];
  return lines.map(wrapLine).join('\r\n');
}

function vtimezoneBlock(): string {
  // Minimal VTIMEZONE covering the 2026 DST rule for America/Los_Angeles,
  // valid for events in October 2026.
  return [
    'BEGIN:VTIMEZONE',
    `TZID:${CAMPUS_TZ}`,
    'BEGIN:DAYLIGHT',
    'DTSTART:20250309T020000',
    'TZOFFSETFROM:-0800',
    'TZOFFSETTO:-0700',
    'TZNAME:PDT',
    'END:DAYLIGHT',
    'BEGIN:STANDARD',
    'DTSTART:20251102T020000',
    'TZOFFSETFROM:-0700',
    'TZOFFSETTO:-0800',
    'TZNAME:PST',
    'END:STANDARD',
    'END:VTIMEZONE',
  ].join('\r\n');
}

export function generateIcsEvent(event: Event): string {
  return [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Campusnaut//PT',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    vtimezoneBlock(),
    eventBlock(event),
    'END:VCALENDAR',
  ].join('\r\n');
}

export function generateIcsCalendar(events: Event[]): string {
  const blocks = events.map(eventBlock).join('\r\n');
  return [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Campusnaut//PT',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    vtimezoneBlock(),
    blocks,
    'END:VCALENDAR',
  ].join('\r\n');
}

export function downloadIcs(filename: string, icsContent: string) {
  const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
