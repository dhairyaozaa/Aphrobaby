import { useEffect, useState } from 'react';
import { useStore } from '../state/Store';
import { Logo } from './art';
import { CloseIcon, MenuIcon, SettingsIcon } from './Icons';

const LINKS = [
  { id: 'home', label: 'Home' },
  { id: 'life', label: 'Her Life' },
  { id: 'diary', label: 'Memories' },
  { id: 'kingdom', label: 'Habitat' },
  { id: 'about', label: 'About' },
];

const OBSERVED = ['home', 'life', 'adventures', 'kingdom', 'diary', 'about'];

export function Nav() {
  const { profile, openSettings, openKeepsake } = useStore();
  const [scrolled, setScrolled] = useState(false);
  const [active, setActive] = useState('home');
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 48);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    const sections = OBSERVED.map((id) => document.getElementById(id)).filter(
      (element): element is HTMLElement => Boolean(element),
    );
    if (!sections.length) return;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) setActive(entry.target.id);
        });
      },
      { rootMargin: '-42% 0px -52% 0px', threshold: 0 },
    );
    sections.forEach((section) => observer.observe(section));
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    document.body.classList.toggle('menu-open', menuOpen);
    return () => document.body.classList.remove('menu-open');
  }, [menuOpen]);

  const navActive = active === 'adventures' ? 'life' : active;

  const activate = (id: string) => {
    setMenuOpen(false);
    const target = document.getElementById(id);
    if (target) {
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <header className={`nav${scrolled ? ' nav--solid' : ''}${menuOpen ? ' nav--open' : ''}`}>
      <div className="nav__inner">
        <a
          className="nav__brand"
          href="#home"
          onClick={(event) => {
            event.preventDefault();
            setMenuOpen(false);
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
        >
          <Logo className="nav__logo" />
          <span className="nav__brand-text">
            <span className="nav__brand-name">{profile.name}&rsquo;s Digital House</span>
            <span className="nav__brand-sub">A little life, counted in every second</span>
          </span>
        </a>

        <nav className="nav__links" aria-label="Primary">
          {LINKS.map((link) => (
            <a
              key={link.id}
              href={`#${link.id}`}
              className={`nav__link${navActive === link.id ? ' is-active' : ''}`}
              aria-current={navActive === link.id ? 'true' : undefined}
              onClick={(event) => {
                event.preventDefault();
                activate(link.id);
              }}
            >
              {link.label}
            </a>
          ))}
        </nav>

        <div className="nav__actions">
          <button type="button" className="nav__settings" onClick={openSettings} aria-label="Open settings">
            <SettingsIcon className="nav__settings-icon" />
            <span>Settings</span>
          </button>
          <button
            type="button"
            className="nav__toggle"
            onClick={() => setMenuOpen((open) => !open)}
            aria-expanded={menuOpen}
            aria-controls="mobile-menu"
            aria-label={menuOpen ? 'Close menu' : 'Open menu'}
          >
            {menuOpen ? <CloseIcon /> : <MenuIcon />}
          </button>
        </div>
      </div>

      <div id="mobile-menu" className={`nav__drawer${menuOpen ? ' is-open' : ''}`} hidden={!menuOpen}>
        <nav className="nav__drawer-links" aria-label="Mobile">
          {LINKS.map((link, index) => (
            <a
              key={link.id}
              href={`#${link.id}`}
              className={navActive === link.id ? 'is-active' : undefined}
              style={{ animationDelay: `${index * 45}ms` }}
              onClick={(event) => {
                event.preventDefault();
                activate(link.id);
              }}
            >
              <span className="nav__drawer-index">{String(index + 1).padStart(2, '0')}</span>
              {link.label}
            </a>
          ))}
          <a
            href="#adventures"
            onClick={(event) => {
              event.preventDefault();
              activate('adventures');
            }}
          >
            <span className="nav__drawer-index">06</span>
            Her Little Adventures
          </a>
        </nav>
        <button type="button" className="btn btn--ghost nav__drawer-settings" onClick={() => { setMenuOpen(false); openSettings(); }}>
          <SettingsIcon className="icon" /> Her settings
        </button>
        <button type="button" className="btn btn--ghost nav__drawer-settings" onClick={() => { setMenuOpen(false); openKeepsake(); }}>
          Her keepsake
        </button>
        <p className="nav__drawer-note">Her exact birth time is {profile.timeEstimated ? 'still estimated' : 'recorded'}.</p>
      </div>
    </header>
  );
}
