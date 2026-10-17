'use client';

import { useState, useCallback } from 'react';
import { TAGS } from '@/lib/events';

interface InterestPickerProps {
  value: string[];
  onChange: (value: string[]) => void;
  error?: string;
}

export default function InterestPicker({ value, onChange, error }: InterestPickerProps) {
  const [input, setInput] = useState('');

  const toggle = useCallback(
    (tag: string) => {
      const lower = tag.toLowerCase();
      if (value.includes(lower)) {
        onChange(value.filter((v) => v !== lower));
      } else {
        onChange([...value, lower]);
      }
    },
    [value, onChange]
  );

  const addCustom = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      const trimmed = input.trim().toLowerCase();
      if (trimmed && !value.includes(trimmed)) {
        onChange([...value, trimmed]);
      }
      setInput('');
    },
    [input, value, onChange]
  );

  return (
    <fieldset className="space-y-3">
      <legend className="font-display text-lg font-bold">Interesses</legend>
      <p className="text-sm text-ink-muted">Seleciona pelo menos uma área ou escreve uma nova.</p>
      <div className="flex flex-wrap gap-2">
        {TAGS.map((tag) => {
          const active = value.includes(tag.toLowerCase());
          return (
            <button
              type="button"
              key={tag}
              onClick={() => toggle(tag)}
              aria-pressed={active}
              className={`min-h-11 rounded-full border-2 px-4 py-2 text-sm font-semibold transition-colors ${
                active
                  ? 'border-tomato bg-tomato text-white'
                  : 'border-ink bg-cream-50 text-ink hover:border-tomato hover:text-tomato'
              }`}
            >
              {tag}
            </button>
          );
        })}
      </div>
      <form onSubmit={addCustom} className="flex gap-2">
        <label htmlFor="custom-interest" className="sr-only">
          Outro interesse
        </label>
        <input
          id="custom-interest"
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="ex: design, robótica, cinema..."
          maxLength={40}
          className="min-h-11 flex-1 rounded-md border-2 border-ink px-3 text-sm focus:border-tomato focus:outline-none"
        />
        <button
          type="submit"
          disabled={!input.trim()}
          className="min-h-11 rounded-md border-2 border-ink bg-ink px-4 text-sm font-semibold text-cream-50 transition-colors hover:bg-tomato disabled:opacity-50"
        >
          Adicionar
        </button>
      </form>
      {value.length > 0 && (
        <div className="flex flex-wrap gap-2 pt-1">
          {value.map((interest) => (
            <span
              key={interest}
              className="inline-flex items-center gap-1 rounded-full border border-ink bg-cream-100 px-3 py-1 text-xs font-medium"
            >
              {interest}
              <button
                type="button"
                onClick={() => onChange(value.filter((v) => v !== interest))}
                className="rounded-full p-1 leading-none hover:bg-tomato hover:text-white"
                aria-label={`Remover ${interest}`}
              >
                ×
              </button>
            </span>
          ))}
        </div>
      )}
      {error && <p className="text-sm font-medium text-tomato">{error}</p>}
    </fieldset>
  );
}
