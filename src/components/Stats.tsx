import {
  computeAge,
  formatDateLong,
  formatNumber,
  splitDuration,
  zonedParts,
} from '../lib/time';
import { useNow } from '../lib/ticker';
import { useStore } from '../state/Store';
import { CakeIcon, LeafIcon, SeedlingIcon, SunIcon } from './Icons';
import { SectionHeading } from './SectionHeading';
import { GrassTuft, Stone } from './art';

export function Stats() {
  const { profile } = useStore();
  const now = useNow();
  const age = computeAge(
    { date: profile.birthDate, time: profile.birthTime, timeZone: profile.timeZone },
    now,
  );
  const countdown = splitDuration(age.untilBirthdayMs);
  const nextParts = zonedParts(age.nextBirthdayMs, profile.timeZone);
  const nextDate = `${nextParts.year}-${String(nextParts.month).padStart(2, '0')}-${String(nextParts.day).padStart(2, '0')}`;
  const birthdayAge = nextParts.year - Number(profile.birthDate.slice(0, 4));

  return (
    <section id="numbers" className="section stats" aria-labelledby="stats-title">
      <div className="container">
        <SectionHeading
          eyebrow="A Life in Numbers"
          title="Every second, gathered"
          id="stats-title"
          lede={`A quiet tally of ${profile.name}'s time in the world. Each figure is read from her birth timestamp the moment you look at it.`}
        />

        <div className="stats__grid">
          <article className="stat-card stat-card--days">
            <LeafIcon className="stat-card__icon" />
            <p className="stat-card__label">Days alive</p>
            <p className="stat-card__value">{formatNumber(age.totalDays)}</p>
            <p className="stat-card__note">sunlit days since {formatDateLong(profile.birthDate)}</p>
            <GrassTuft className="stat-card__art stat-card__art--grass" />
          </article>

          <article className="stat-card stat-card--hours">
            <SeedlingIcon className="stat-card__icon" />
            <p className="stat-card__label">Hours alive</p>
            <p className="stat-card__value">{formatNumber(age.totalHours)}</p>
            <p className="stat-card__note">hours of slow wandering and warm stone</p>
            <Stone className="stat-card__art stat-card__art--stone" />
          </article>

          <article className="stat-card stat-card--sunrises">
            <SunIcon className="stat-card__icon" />
            <p className="stat-card__label">
              Sunrises
              <span className="badge badge--estimate" title="Estimated from local calendar dates">
                estimate
              </span>
            </p>
            <p className="stat-card__value">{formatNumber(age.sunrises)}</p>
            <p className="stat-card__note">
              local calendar dates since her first morning, counted inclusively in{' '}
              {profile.timeZone}
            </p>
            <span className="stat-card__glow" aria-hidden="true" />
          </article>

          <article className="stat-card stat-card--birthday">
            <CakeIcon className="stat-card__icon" />
            <p className="stat-card__label">Next birthday</p>
            <p className="stat-card__value stat-card__value--date">{formatDateLong(nextDate)}</p>
            <p className="stat-card__note">
              her {birthdayAge === 1 ? 'first' : `${birthdayAge}${suffix(birthdayAge)}`} birthday
            </p>
            <p className="stat-card__countdown" aria-live="off">
              <span className="stat-card__countdown-piece">
                {formatNumber(countdown.days)}
                <span>days</span>
              </span>
              <span className="stat-card__countdown-piece">
                {String(countdown.hours).padStart(2, '0')}
                <span>hrs</span>
              </span>
              <span className="stat-card__countdown-piece">
                {String(countdown.minutes).padStart(2, '0')}
                <span>min</span>
              </span>
              <span className="stat-card__countdown-piece">
                {String(countdown.seconds).padStart(2, '0')}
                <span>sec</span>
              </span>
            </p>
          </article>
        </div>

        <div className="stats__extra">
          <div className="stats__extra-item">
            <span className="stats__extra-value">{formatNumber(age.weeks)}</span>
            <span className="stats__extra-label">weeks alive</span>
          </div>
          <div className="stats__extra-item">
            <span className="stats__extra-value">{formatNumber(age.totalMonths)}</span>
            <span className="stats__extra-label">months alive</span>
          </div>
          <div className="stats__extra-item">
            <span className="stats__extra-value">{formatNumber(age.totalMinutes)}</span>
            <span className="stats__extra-label">minutes alive</span>
          </div>
          <div className="stats__extra-item">
            <span className="stats__extra-value">{formatNumber(age.totalSeconds)}</span>
            <span className="stats__extra-label">seconds alive</span>
          </div>
        </div>
      </div>
    </section>
  );
}

function suffix(value: number): string {
  const lastTwo = value % 100;
  if (lastTwo >= 11 && lastTwo <= 13) return 'th';
  switch (value % 10) {
    case 1:
      return 'st';
    case 2:
      return 'nd';
    case 3:
      return 'rd';
    default:
      return 'th';
  }
}
