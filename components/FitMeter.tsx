interface FitMeterProps {
  fit: number; // 0..1
  label?: string;
}

export default function FitMeter({ fit, label }: FitMeterProps) {
  const safe = Math.min(1, Math.max(0, fit));
  const percentage = Math.round(safe * 100);
  return (
    <div className="w-full">
      <div className="mb-1 flex items-center justify-between text-xs font-medium">
        <span className="uppercase tracking-wide text-ink-light">{label || 'Encaixe'}</span>
        <span className="font-display font-bold">{percentage}%</span>
      </div>
      <div className="h-3 w-full overflow-hidden rounded-full border border-ink bg-cream-200">
        <div
          className="h-full rounded-full bg-tomato transition-all duration-500 ease-out motion-reduce:transition-none"
          style={{ width: `${percentage}%` }}
          aria-hidden="true"
        />
      </div>
    </div>
  );
}
