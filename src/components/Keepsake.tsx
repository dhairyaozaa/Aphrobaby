import { useEffect, useMemo, useRef } from 'react';
import { createPortal } from 'react-dom';
import type { Milestone } from '../lib/types';
import {
  computeAge,
  formatClockTime,
  formatDateLong,
  formatDateShort,
  formatNumber,
  timeZoneLabel,
  todayISO,
} from '../lib/time';
import { useStore } from '../state/Store';
import { CloseIcon, PrintIcon } from './Icons';
import { Logo, PortraitStudy, Sprig } from './art';
import { PhotoView } from './PhotoView';
import { StoredImage } from './StoredImage';

/**
 * A quiet, printable summary of Aphrodite's life. It is mounted only while open, so the age is
 * read at the moment the keepsake is opened and then held still — a page, not another clock.
 */
export function Keepsake() {
  const { profile, milestones, photos, closeKeepsake } = useStore();
  const now = useMemo(() => Date.now(), []);
  const age = computeAge(
    { date: profile.birthDate, time: profile.birthTime, timeZone: profile.timeZone },
    now,
  );
  const today = todayISO(profile.timeZone, now);

  const sheetRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const previous =
      document.activeElement instanceof HTMLElement ? document.activeElement : null;
    document.body.classList.add('keepsake-open');
    closeRef.current?.focus();

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        closeKeepsake();
        return;
      }
      if (event.key !== 'Tab' || !sheetRef.current) return;
      const focusable = Array.from(
        sheetRef.current.querySelectorAll<HTMLElement>('button, [href], [tabindex]:not([tabindex="-1"])'),
      ).filter((node) => node.offsetParent !== null);
      if (!focusable.length) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.body.classList.remove('keepsake-open');
      previous?.focus?.();
    };
  }, [closeKeepsake]);

  const past = milestones.filter((milestone) => milestone.date <= today);
  const upcoming = milestones.find((milestone) => milestone.date > today);
  const seen = new Set<string>();
  const chapters: Milestone[] = [];
  const remember = (milestone?: Milestone) => {
    if (milestone && !seen.has(milestone.id)) {
      seen.add(milestone.id);
      chapters.push(milestone);
    }
  };
  remember(past[0]);
  past.slice(-2).forEach(remember);
  remember(upcoming);

  const favourite = photos.find((photo) => !photo.id.startsWith('plate-')) ?? null;

  const figures = [
    { value: formatNumber(age.totalDays), label: 'Days alive' },
    { value: formatNumber(age.sunrises), label: 'Sunrises' },
    { value: formatNumber(age.weeks), label: 'Weeks' },
    { value: formatNumber(age.totalHours), label: 'Hours' },
  ];

  const units = [
    { value: age.years, label: 'Years' },
    { value: age.months, label: 'Months' },
    { value: age.days, label: 'Days' },
  ];

  return createPortal(
    <div className="keepsake" role="dialog" aria-modal="true" aria-labelledby="keepsake-name">
      <div className="keepsake__scrim" onClick={closeKeepsake} aria-hidden="true" />

      <div className="keepsake__sheet" ref={sheetRef}>
        <div className="keepsake__bar">
          <p>
            <span>A keepsake</span> of {profile.name}
          </p>
          <div className="keepsake__bar-actions">
            <button
              type="button"
              className="btn btn--soft keepsake__print"
              onClick={() => window.print()}
            >
              <PrintIcon className="icon" />
              Print or save as PDF
            </button>
            <button
              type="button"
              className="icon-btn keepsake__close"
              onClick={closeKeepsake}
              aria-label="Close keepsake"
              ref={closeRef}
            >
              <CloseIcon />
            </button>
          </div>
        </div>

        <article className="keepsake__paper">
          <span className="keepsake__corner keepsake__corner--tl" aria-hidden="true">
            <Sprig />
          </span>
          <span className="keepsake__corner keepsake__corner--tr" aria-hidden="true">
            <Sprig />
          </span>
          <span className="keepsake__corner keepsake__corner--bl" aria-hidden="true">
            <Sprig />
          </span>
          <span className="keepsake__corner keepsake__corner--br" aria-hidden="true">
            <Sprig />
          </span>

          <header className="keepsake__header">
            <Logo className="keepsake__crest" />
            <p className="keepsake__house">{profile.name}&rsquo;s Digital House</p>
            <p className="keepsake__motto">A little life, counted in every second.</p>
          </header>

          <div className="keepsake__portrait-wrap">
            <div className="keepsake__portrait">
              {profile.portraitPhotoId ? (
                <StoredImage
                  photoId={profile.portraitPhotoId}
                  alt={`A portrait of ${profile.name}`}
                  loading="lazy"
                />
              ) : (
                <PortraitStudy />
              )}
            </div>
          </div>

          <h2 className="keepsake__name" id="keepsake-name">
            {profile.name}
          </h2>
          <p className="keepsake__born">
            Born approximately {formatDateLong(profile.birthDate)} at{' '}
            {formatClockTime(profile.birthTime)} {timeZoneLabel(profile.timeZone, now)}
            {profile.timeEstimated ? ' · estimated' : ' · recorded'}
          </p>

          <div className="keepsake__age">
            {units.map((unit) => (
              <div className="keepsake__age-unit" key={unit.label}>
                <span className="keepsake__age-value">{String(unit.value).padStart(2, '0')}</span>
                <span className="keepsake__age-label">{unit.label}</span>
              </div>
            ))}
          </div>
          <p className="keepsake__age-note">
            {formatNumber(age.totalDays)} days, {formatNumber(age.totalHours)} hours and{' '}
            {formatNumber(age.totalSeconds)} seconds so far.
          </p>

          <div className="keepsake__numbers">
            {figures.map((figure) => (
              <div className="keepsake__number" key={figure.label}>
                <strong>{figure.value}</strong>
                <span>{figure.label}*</span>
              </div>
            ))}
          </div>
          <p className="keepsake__estimate">
            * Sunrises are estimated inclusively from her local calendar dates.
          </p>

          <blockquote className="keepsake__message">
            {profile.description.trim() ||
              'A quiet, unhurried life in a house built entirely for her — moss, warm stone, and someone who notices.'}
          </blockquote>

          <section className="keepsake__chapters" aria-labelledby="keepsake-chapters">
            <h3 id="keepsake-chapters">Small chapters</h3>
            <ul>
              {chapters.map((chapter) => (
                <li className="keepsake__chapter" key={chapter.id}>
                  <span className="keepsake__chapter-date">{formatDateShort(chapter.date)}</span>
                  <span className="keepsake__chapter-title">{chapter.title}</span>
                  {chapter.special ? (
                    <span className="keepsake__chapter-star" aria-label="a favourite memory">
                      ✦
                    </span>
                  ) : null}
                </li>
              ))}
            </ul>
          </section>

          {favourite ? (
            <figure className="keepsake__photo">
              <PhotoView photo={favourite} loading="lazy" />
              {favourite.caption ? <figcaption>{favourite.caption}</figcaption> : null}
            </figure>
          ) : null}

          <footer className="keepsake__footer">
            <Sprig className="keepsake__footer-sprig" />
            <p className="keepsake__quote">&ldquo;Small footsteps. Endless memories.&rdquo;</p>
            <p className="keepsake__kept">Kept on {formatDateLong(today)}</p>
          </footer>
        </article>
      </div>
    </div>,
    document.body,
  );
}
