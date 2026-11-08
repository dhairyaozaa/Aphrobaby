import type { Age } from '../lib/time';
import { pad } from '../lib/time';

interface ClockDisplayProps {
  age: Age;
  compact?: boolean;
}

export function ClockDisplay({ age, compact = false }: ClockDisplayProps) {
  const units = [
    { key: 'years', value: pad(age.years), label: 'Years' },
    { key: 'months', value: pad(age.months), label: 'Months' },
    { key: 'days', value: pad(age.days), label: 'Days' },
    { key: 'hours', value: pad(age.hours), label: 'Hours' },
    { key: 'minutes', value: pad(age.minutes), label: 'Minutes' },
    { key: 'seconds', value: pad(age.seconds), label: 'Seconds' },
  ];

  const summary = `${age.years} years, ${age.months} months, ${age.days} days, ${age.hours} hours, ${age.minutes} minutes and ${age.seconds} seconds alive`;

  return (
    <div
      className={`clock-display${compact ? ' clock-display--compact' : ''}`}
      role="group"
      aria-label="Aphrodite's age"
    >
      <span className="sr-only" aria-live="off">
        {summary}
      </span>
      {units.map((unit) => (
        <div className="clock-display__unit" key={unit.key}>
          <span
            key={`${unit.key}-${unit.value}`}
            className={`clock-display__value${unit.key === 'seconds' ? ' clock-display__value--tick' : ''}`}
            aria-hidden="true"
          >
            {unit.value}
          </span>
          <span className="clock-display__label" aria-hidden="true">
            {unit.label}
          </span>
        </div>
      ))}
    </div>
  );
}
