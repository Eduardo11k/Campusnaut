import { NextResponse } from 'next/server';
import { getAllEvents } from '@/lib/events';

export async function GET() {
  const events = getAllEvents();
  return NextResponse.json({
    ok: true,
    count: events.length,
    events,
  });
}
