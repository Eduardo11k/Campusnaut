import { differenceInMinutes, format as formatDateFns } from 'date-fns';
import { formatInTimeZone, fromZonedTime } from 'date-fns-tz';

export const CAMPUS_TZ = process.env.CAMPUS_TZ ?? 'America/Los_Angeles';

export function parseEventZonedDate(event: { date: string; start: string; end: string }) {
  const startZoned = `${event.date}T${event.start}:00`;
  const endZoned = `${event.date}T${event.end}:00`;
  return {
    start: fromZonedTime(startZoned, CAMPUS_TZ),
    end: fromZonedTime(endZoned, CAMPUS_TZ),
  };
}

export function formatEventDateTime(
  event: { date: string; start: string; end: string },
  fmt = "EEEE, d 'de' MMMM 'às' HH:mm"
) {
  const { start } = parseEventZonedDate(event);
  return formatInTimeZone(start, CAMPUS_TZ, fmt, { locale: undefined });
}

export function formatEventRange(event: { date: string; start: string; end: string }) {
  const { start, end } = parseEventZonedDate(event);
  const datePart = formatInTimeZone(start, CAMPUS_TZ, "EEEE, d 'de' MMMM", { locale: undefined });
  const startPart = formatInTimeZone(start, CAMPUS_TZ, 'HH:mm', { locale: undefined });
  const endPart = formatInTimeZone(end, CAMPUS_TZ, 'HH:mm', { locale: undefined });
  return `${datePart} · ${startPart} – ${endPart}`;
}

export function formatEventTime(event: { date: string; start: string; end: string }) {
  const { start, end } = parseEventZonedDate(event);
  return `${formatInTimeZone(start, CAMPUS_TZ, 'HH:mm')}–${formatInTimeZone(
    end,
    CAMPUS_TZ,
    'HH:mm'
  )}`;
}

export function formatEventDateOnly(event: { date: string }) {
  const zoned = fromZonedTime(`${event.date}T12:00:00`, CAMPUS_TZ);
  return formatInTimeZone(zoned, CAMPUS_TZ, "EEEE, d 'de' MMMM", { locale: undefined });
}

export function eventDurationMinutes(event: { date: string; start: string; end: string }) {
  const { start, end } = parseEventZonedDate(event);
  return differenceInMinutes(end, start);
}

export function icsDateTime(dt: Date) {
  return formatDateFns(dt, "yyyyMMdd'T'HHmmss");
}
