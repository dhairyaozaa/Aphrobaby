import { useEffect, useState } from 'react';
import { computeAge, formatClockTime, formatDateLong, timeZoneLabel } from '../lib/time';
import { useStore } from '../state/Store';
import { ArrowDownIcon } from './Icons';
import { HabitatScene } from './HabitatScene';

function plural(value: number, singular: string): string {
  return `${value} ${value === 1 ? singular : `${singular}s`}`;
}

export function Hero() {
  const { profile } = useStore();
  // The hero shows whole days, not seconds: refresh once a minute instead of re-rendering
  // the habitat every tick. The full seconds clock lives in Her Life.
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const refresh = () => setNow(Date.now());
    const timer = window.setInterval(refresh, 60_000);
    const onVisibility = () => {
      if (!document.hidden) refresh();
    };
    document.addEventListener('visibilitychange', onVisibility);
    return () => {
      window.clearInterval(timer);
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, []);

  const age = computeAge(
    { date: profile.birthDate, time: profile.birthTime, timeZone: profile.timeZone },
    now,
  );

  return (
    <section id="home" className="hero" aria-labelledby="hero-title">
      <HabitatScene variant="hero" wander />
      <div className="hero__veil" />

      <div className="container hero__inner">
        <div className="hero__content">
          <p className="hero__eyebrow">
            <span className="hero__eyebrow-rule" aria-hidden="true" />
            A little world belonging to
          </p>
          <h1 className="hero__title" id="hero-title">
            {profile.name}
          </h1>
          <div className="hero__hairline" aria-hidden="true" />
          <p className="hero__support">Welcome to her little corner of the universe.</p>

          {age.valid ? (
            <p className="hero__age">
              <span className="hero__age-label">She has been here for</span>
              <span className="hero__age-value">
                {plural(age.years, 'year')}
                <span className="hero__age-sep" aria-hidden="true">
                  ·
                </span>
                {plural(age.months, 'month')}
                <span className="hero__age-sep" aria-hidden="true">
                  ·
                </span>
                {plural(age.days, 'day')}
              </span>
            </p>
          ) : (
            <p className="hero__age">
              <span className="hero__age-value">Her story is just beginning.</span>
            </p>
          )}

          <p className="hero__birth">
            Born approximately <span aria-hidden="true">·</span> {formatDateLong(profile.birthDate)}
            <span className="hero__birth-meta">
              {formatClockTime(profile.birthTime)} {timeZoneLabel(profile.timeZone, now)}
              {profile.timeEstimated ? ' · birth time estimated' : ' · birth time recorded'}
            </span>
          </p>

          <p className="hero__tagline">A little life, counted in every second.</p>
        </div>

        <a
          className="hero__scroll"
          href="#life"
          onClick={(event) => {
            event.preventDefault();
            document.getElementById('life')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }}
        >
          <span>Wander into her world</span>
          <ArrowDownIcon className="hero__scroll-icon" />
        </a>
      </div>

      <p className="hero__aside" aria-hidden="true">
        Her little corner of the universe — est. {formatDateLong(profile.birthDate)}
      </p>
    </section>
  );
}
