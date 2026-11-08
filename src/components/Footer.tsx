import { computeAge, formatClockTime, formatDateLong, pad } from '../lib/time';
import { useNow } from '../lib/ticker';
import { useStore } from '../state/Store';
import { Logo, Tortoise } from './art';

const LINKS = [
  { id: 'home', label: 'Home' },
  { id: 'life', label: 'Her Life' },
  { id: 'diary', label: 'Aphrodite’s Diary' },
  { id: 'kingdom', label: 'Her Little Kingdom' },
  { id: 'adventures', label: 'Her Little Adventures' },
  { id: 'about', label: 'About Aphrodite' },
];

export function Footer() {
  const { profile, openSettings, openKeepsake } = useStore();
  const now = useNow();
  const age = computeAge(
    { date: profile.birthDate, time: profile.birthTime, timeZone: profile.timeZone },
    now,
  );

  const go = (id: string) => {
    if (id === 'home') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <footer className="footer">
      <div className="container footer__inner">
        <div className="footer__brand">
          <Logo className="footer__logo" />
          <div>
            <p className="footer__name">{profile.name}&rsquo;s Digital House</p>
            <p className="footer__quote">&ldquo;Small footsteps. Endless memories.&rdquo;</p>
          </div>
        </div>

        <div className="footer__live">
          <p className="footer__live-label">A little forever &mdash; live</p>
          <p className="footer__live-value">
            {age.years}<span>y</span> {pad(age.months)}<span>m</span> {pad(age.days)}<span>d</span>
          </p>
          <p className="footer__live-time">
            {pad(age.hours)}:{pad(age.minutes)}:{pad(age.seconds)} and counting
          </p>
        </div>

        <nav className="footer__links" aria-label="Footer">
          {LINKS.map((link) => (
            <a
              key={link.id}
              href={`#${link.id}`}
              onClick={(event) => {
                event.preventDefault();
                go(link.id);
              }}
            >
              {link.label}
            </a>
          ))}
          <button type="button" className="footer__settings" onClick={openKeepsake}>
            Her keepsake
          </button>
          <button type="button" className="footer__settings" onClick={openSettings}>
            Settings
          </button>
        </nav>

        <div className="footer__meta">
          <p>
            Estimated birth <span aria-hidden="true">·</span> {formatDateLong(profile.birthDate)} at{' '}
            {formatClockTime(profile.birthTime)} {profile.timeEstimated ? '(believed)' : '(recorded)'}
          </p>
          <p>A little life, counted in every second.</p>
        </div>
      </div>

      <div className="footer__tortoise" aria-hidden="true">
        <Tortoise />
      </div>
    </footer>
  );
}
