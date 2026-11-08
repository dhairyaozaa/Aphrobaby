import {
  computeAge,
  formatClockTime,
  formatDateLong,
  formatNumber,
  timeZoneLabel,
} from '../lib/time';
import { useNow } from '../lib/ticker';
import { useStore } from '../state/Store';
import { ClockIcon, PencilLeafIcon } from './Icons';
import { ClockDisplay } from './ClockDisplay';
import { Sprig } from './art';

export function LifeClock() {
  const { profile, openSettings } = useStore();
  const now = useNow();
  const age = computeAge(
    { date: profile.birthDate, time: profile.birthTime, timeZone: profile.timeZone },
    now,
  );

  return (
    <section id="life" className="section life" aria-labelledby="life-title">
      <div className="container">
        <header className="section-head section-head--center">
          <div className="section-head__text">
            <p className="eyebrow">
              <ClockIcon className="eyebrow__icon" />
              <span>Aphrodite&rsquo;s Life Clock</span>
            </p>
            <h2 className="section-head__title" id="life-title">
              Her Life
            </h2>
            <p className="lede">
              Every second, measured honestly from the moment her life began &mdash; not counted up,
              but calculated fresh each time the clock chimes.
            </p>
          </div>
        </header>

        <div className="clock-card">
          <div className="clock-card__ornament clock-card__ornament--tl" aria-hidden="true">
            <Sprig />
          </div>
          <div className="clock-card__ornament clock-card__ornament--br" aria-hidden="true">
            <Sprig />
          </div>

          <div className="clock-card__head">
            <div>
              <p className="clock-card__name">{profile.name}</p>
              <p className="clock-card__sub">has been alive for</p>
            </div>
            <span className={`pill${profile.timeEstimated ? ' pill--warm' : ' pill--green'}`}>
              {profile.timeEstimated ? 'Birth time estimated' : 'Birth time recorded'}
            </span>
          </div>

          {age.valid ? (
            <ClockDisplay age={age} />
          ) : (
            <p className="clock-card__invalid" role="alert">
              Her birth details need checking before the clock can run.
            </p>
          )}

          <div className="clock-card__foot">
            <p>
              Born <strong>{formatDateLong(profile.birthDate)}</strong> at{' '}
              <strong>{formatClockTime(profile.birthTime)}</strong>{' '}
              <span className="muted">
                ({timeZoneLabel(profile.timeZone, now)} · {profile.timeZone})
              </span>
            </p>
            <button type="button" className="linkish" onClick={openSettings}>
              <PencilLeafIcon className="linkish__icon" />
              Correct her birth details
            </button>
          </div>

          {profile.timeEstimated ? (
            <p className="clock-card__note">
              Her exact birth time is not yet known, so this clock assumes{' '}
              {formatClockTime(profile.birthTime)} until you add the real one in settings. Change it
              any time and every number here will recompute from that single moment.
            </p>
          ) : null}

          {age.beforeBirth ? (
            <p className="clock-card__note" role="status">
              Her birth date is in the future, so the countdown is waiting at zero. The clock will
              begin on its own when the day arrives.
            </p>
          ) : null}

          <div className="clock-card__totals">
            <div>
              <span className="clock-card__total-label">Total days</span>
              <span className="clock-card__total-value">{formatNumber(age.totalDays)}</span>
            </div>
            <div>
              <span className="clock-card__total-label">Total hours</span>
              <span className="clock-card__total-value">{formatNumber(age.totalHours)}</span>
            </div>
            <div>
              <span className="clock-card__total-label">Total minutes</span>
              <span className="clock-card__total-value">{formatNumber(age.totalMinutes)}</span>
            </div>
            <div>
              <span className="clock-card__total-label">Total seconds</span>
              <span className="clock-card__total-value">{formatNumber(age.totalSeconds)}</span>
            </div>
          </div>
        </div>

        <p className="life__footnote">
          <span className="life__footnote-rule" aria-hidden="true" />
          Recalculated from her birth timestamp and this device&rsquo;s clock every second &mdash;
          leap years, short months and year boundaries included.
        </p>
      </div>
    </section>
  );
}
