export interface Event {
  id: string;
  title: string;
  description: string;
  date: string; // YYYY-MM-DD
  start: string; // HH:mm
  end: string; // HH:mm
  location: string;
  tags: string[];
  price: number;
  link: string;
}

export interface Pick {
  event_id: string;
  reason: string;
  fit: number;
}

export interface NotRecommended {
  event_id: string;
  reason: string;
}

export interface RecommendationOutput {
  picks: Pick[];
  not_recommended: NotRecommended[];
  explanation?: string;
}

export type DayKey = 'mon' | 'tue' | 'wed' | 'thu' | 'fri' | 'sat' | 'sun';
