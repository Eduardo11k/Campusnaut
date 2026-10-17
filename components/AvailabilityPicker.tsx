'use client';

import { DAY_LABELS, type DayKey } from '@/lib/events';

const DAY_ORDER: DayKey[] = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'];

interface AvailabilityPickerProps {
  days: DayKey[];
  onDaysChange: (days: DayKey[]) => void;
  freeTimes: string;
  onFreeTimesChange: (value: string) => void;
  daysError?: string;
}

export default function AvailabilityPicker({
  days,
  onDaysChange,
  freeTimes,
  onFreeTimesChange,
  daysError,
}: AvailabilityPickerProps) {
  const toggle = (day: DayKey) => {
    if (days.includes(day)) {
      onDaysChange(days.filter((d) => d !== day));
    } else {
      onDaysChange([...days, day]);
    }
  };

  return (
    <fieldset className="space-y-4">
      <legend className="font-display text-lg font-bold">Quando estás livre?</legend>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 md:grid-cols-7">
        {DAY_ORDER.map((day) => {
          const active = days.includes(day);
          return (
            <button
              type="button"
              key={day}
              onClick={() => toggle(day)}
              aria-pressed={active}
              className={`min-h-11 rounded-lg border-2 px-2 py-2 text-sm font-semibold transition-colors ${
                active
                  ? 'border-tomato bg-tomato text-white'
                  : 'border-ink bg-cream-50 text-ink hover:border-tomato hover:text-tomato'
              }`}
            >
              {DAY_LABELS[day]}
            </button>
          );
        })}
      </div>
      {daysError && <p className="text-sm font-medium text-tomato">{daysError}</p>}
      <div>
        <label htmlFor="free-times" className="mb-1 block text-sm font-semibold">
          Horas livres <span className="font-normal text-ink-light">(opcional)</span>
        </label>
        <textarea
          id="free-times"
          rows={3}
          value={freeTimes}
          onChange={(e) => onFreeTimesChange(e.target.value)}
          placeholder="ex.: só à tarde, depois das 18h, manhãs livres..."
          maxLength={240}
          className="w-full min-h-[88px] resize-y rounded-md border-2 border-ink px-3 py-2 text-sm focus:border-tomato focus:outline-none"
        />
      </div>
    </fieldset>
  );
}
