import { useEffect, useMemo, useRef, useState } from 'react';
import type { Profile } from '../lib/types';
import { THEMES } from '../lib/seed';
import {
  getTimeZoneOptions,
  isValidDateString,
  isValidTimeString,
  isValidTimeZone,
} from '../lib/time';
import { useStore } from '../state/Store';
import { CameraIcon, CloseIcon, LeafIcon, TrashIcon } from './Icons';
import { PortraitStudy } from './art';
import { StoredImage } from './StoredImage';

export function SettingsPanel() {
  const {
    profile,
    photos,
    milestones,
    settingsOpen,
    closeSettings,
    updateProfile,
    setPortrait,
    resetEverything,
    confirmAction,
    notify,
  } = useStore();

  const [draft, setDraft] = useState<Profile>(profile);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const portraitInput = useRef<HTMLInputElement>(null);
  const zones = useMemo(() => getTimeZoneOptions(), []);

  useEffect(() => {
    if (!settingsOpen) return;
    setDraft(profile);
    setError('');
    document.body.classList.add('modal-open');
    const previous = document.activeElement as HTMLElement | null;
    const focusTimer = window.setTimeout(() => closeRef.current?.focus(), 60);

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        closeSettings();
        return;
      }
      if (event.key !== 'Tab' || !panelRef.current) return;
      const nodes = Array.from(
        panelRef.current.querySelectorAll<HTMLElement>(
          'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
        ),
      ).filter((element) => element.offsetParent !== null);
      if (!nodes.length) return;
      const first = nodes[0];
      const last = nodes[nodes.length - 1];
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
      window.clearTimeout(focusTimer);
      document.removeEventListener('keydown', onKeyDown);
      document.body.classList.remove('modal-open');
      previous?.focus?.();
    };
    // The draft is seeded only when the drawer opens, so edits survive portrait changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [settingsOpen]);

  if (!settingsOpen) return null;

  const save = () => {
    const name = draft.name.trim();
    if (!name) {
      setError('She needs a name.');
      return;
    }
    if (!isValidDateString(draft.birthDate)) {
      setError('That birth date is not valid. Please check the day, month and year.');
      return;
    }
    if (!isValidTimeString(draft.birthTime)) {
      setError('That birth time is not valid. Use a 24-hour time such as 12:00.');
      return;
    }
    if (!isValidTimeZone(draft.timeZone.trim())) {
      setError('That time zone is not recognised. Try a name like Asia/Kolkata.');
      return;
    }
    updateProfile({
      ...draft,
      name,
      birthTime: draft.birthTime.slice(0, 5),
      timeZone: draft.timeZone.trim(),
      species: draft.species.trim(),
      favouriteFoods: draft.favouriteFoods.trim(),
      personality: draft.personality.trim(),
      description: draft.description.trim(),
      notes: draft.notes.trim(),
    });
    notify('Her house has been updated.');
    closeSettings();
  };

  const choosePortrait = async (file: File | undefined, input: HTMLInputElement) => {
    if (!file) return;
    setBusy(true);
    try {
      await setPortrait(file);
      notify('Her portrait has been updated.');
    } catch (uploadError) {
      notify(uploadError instanceof Error ? uploadError.message : 'That photograph could not be used.', 'error');
    } finally {
      setBusy(false);
      input.value = '';
    }
  };

  const removePortrait = async () => {
    setBusy(true);
    try {
      await setPortrait(null);
      notify('Her illustrated portrait is back.');
    } catch {
      notify('The portrait could not be removed.', 'error');
    } finally {
      setBusy(false);
    }
  };

  const resetHouse = async () => {
    const confirmed = await confirmAction({
      title: 'Reset her whole house?',
      message:
        'Every photograph, milestone, caption and setting stored in this browser will be removed, and the house will return to its first day. This cannot be undone.',
      confirmLabel: 'Reset everything',
      danger: true,
    });
    if (!confirmed) return;
    await resetEverything();
    notify('The house has been returned to its first day.');
  };

  const goTo = (id: string) => {
    closeSettings();
    window.setTimeout(() => {
      document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 320);
  };

  return (
    <div className="settings">
      <div className="settings__scrim" onClick={closeSettings} aria-hidden="true" />
      <div
        className="settings__panel"
        role="dialog"
        aria-modal="true"
        aria-labelledby="settings-title"
        ref={panelRef}
      >
        <header className="settings__head">
          <div>
            <p className="eyebrow">Her house</p>
            <h2 id="settings-title">Settings</h2>
          </div>
          <button
            type="button"
            className="icon-btn"
            onClick={closeSettings}
            aria-label="Close settings"
            ref={closeRef}
          >
            <CloseIcon />
          </button>
        </header>

        <div className="settings__body">
          <section className="settings__section">
            <h3 className="settings__section-title">Her details</h3>
            <p className="settings__hint">The small facts that belong on her profile page.</p>

            <label className="field">
              <span className="field__label">Her name</span>
              <input
                className="field__input"
                value={draft.name}
                maxLength={40}
                onChange={(event) => setDraft({ ...draft, name: event.target.value })}
              />
            </label>

            <label className="field">
              <span className="field__label">Species</span>
              <input
                className="field__input"
                value={draft.species}
                maxLength={80}
                placeholder="e.g. Mediterranean spur-thighed tortoise"
                onChange={(event) => setDraft({ ...draft, species: event.target.value })}
              />
            </label>

            <label className="field">
              <span className="field__label">Favourite foods</span>
              <input
                className="field__input"
                value={draft.favouriteFoods}
                maxLength={140}
                placeholder="Dandelion leaves, cucumber, clover…"
                onChange={(event) => setDraft({ ...draft, favouriteFoods: event.target.value })}
              />
            </label>

            <label className="field">
              <span className="field__label">Personality</span>
              <input
                className="field__input"
                value={draft.personality}
                maxLength={140}
                placeholder="Curious, unhurried, fond of warm stones"
                onChange={(event) => setDraft({ ...draft, personality: event.target.value })}
              />
            </label>
          </section>

          <section className="settings__section">
            <h3 className="settings__section-title">Her birth moment</h3>
            <p className="settings__hint">
              Every number in the house is calculated from this moment. If you correct it, the whole
              clock follows.
            </p>

            <div className="form__row">
              <label className="field">
                <span className="field__label">Birth date</span>
                <input
                  className="field__input"
                  type="date"
                  min="1900-01-01"
                  max="2200-12-31"
                  value={draft.birthDate}
                  onChange={(event) => setDraft({ ...draft, birthDate: event.target.value })}
                />
              </label>
              <label className="field">
                <span className="field__label">Birth time (24-hour)</span>
                <input
                  className="field__input"
                  type="time"
                  value={draft.birthTime}
                  onChange={(event) => setDraft({ ...draft, birthTime: event.target.value })}
                />
              </label>
            </div>

            <label className="field field--check">
              <input
                type="checkbox"
                checked={draft.timeEstimated}
                onChange={(event) => setDraft({ ...draft, timeEstimated: event.target.checked })}
              />
              <span>
                Her birth time is estimated
                <small>
                  Leave this ticked until you know the real time. The house will label the clock
                  honestly.
                </small>
              </span>
            </label>

            <label className="field">
              <span className="field__label">Time zone</span>
              <input
                className="field__input"
                list="timezone-options"
                value={draft.timeZone}
                onChange={(event) => setDraft({ ...draft, timeZone: event.target.value })}
                placeholder="Asia/Kolkata"
              />
              <datalist id="timezone-options">
                {zones.map((zone) => (
                  <option key={zone} value={zone} />
                ))}
              </datalist>
              <span className="field__note">
                All dates and ages are read in this zone.{' '}
                <button
                  type="button"
                  className="linkish"
                  onClick={() =>
                    setDraft({
                      ...draft,
                      timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC',
                    })
                  }
                >
                  Use this device&rsquo;s zone
                </button>
              </span>
            </label>
          </section>

          <section className="settings__section">
            <h3 className="settings__section-title">Her portrait</h3>
            <div className="settings__portrait">
              <div className="settings__portrait-frame">
                {profile.portraitPhotoId ? (
                  <StoredImage
                    photoId={profile.portraitPhotoId}
                    alt={`A portrait of ${profile.name}`}
                    className="settings__portrait-image"
                  />
                ) : (
                  <PortraitStudy className="settings__portrait-image" />
                )}
              </div>
              <div className="settings__portrait-actions">
                <p className="settings__hint">
                  {profile.portraitPhotoId
                    ? 'Her photograph is saved in this browser only.'
                    : 'An original illustration is standing in until you add a photograph.'}
                </p>
                <button
                  type="button"
                  className="btn btn--soft"
                  onClick={() => portraitInput.current?.click()}
                  disabled={busy}
                >
                  <CameraIcon className="icon" />
                  {profile.portraitPhotoId ? 'Replace photograph' : 'Add photograph'}
                </button>
                {profile.portraitPhotoId ? (
                  <button type="button" className="mini-btn mini-btn--danger" onClick={removePortrait} disabled={busy}>
                    <TrashIcon />
                    Remove photograph
                  </button>
                ) : null}
                <input
                  ref={portraitInput}
                  type="file"
                  accept="image/*"
                  className="sr-only"
                  onChange={(event) => choosePortrait(event.target.files?.[0], event.currentTarget)}
                />
              </div>
            </div>
          </section>

          <section className="settings__section">
            <h3 className="settings__section-title">Her story</h3>
            <p className="settings__hint">
              These words appear on her About page, in your own voice.
            </p>
            <label className="field">
              <span className="field__label">A message about her</span>
              <textarea
                className="field__input field__input--area"
                rows={6}
                maxLength={1600}
                value={draft.description}
                placeholder="How she came into your life, what she is like, the things you want to remember…"
                onChange={(event) => setDraft({ ...draft, description: event.target.value })}
              />
            </label>
            <label className="field">
              <span className="field__label">Notes for her keeper</span>
              <textarea
                className="field__input field__input--area"
                rows={3}
                maxLength={800}
                value={draft.notes}
                placeholder="Care notes, routines, small reminders…"
                onChange={(event) => setDraft({ ...draft, notes: event.target.value })}
              />
            </label>
          </section>

          <section className="settings__section">
            <h3 className="settings__section-title">The mood of the house</h3>
            <p className="settings__hint">Three botanical themes. The palette stays hers.</p>
            <div className="theme-picker" role="radiogroup" aria-label="Website theme">
              {THEMES.map((theme) => (
                <label
                  key={theme.id}
                  className={`theme-option${draft.theme === theme.id ? ' is-selected' : ''}`}
                >
                  <input
                    type="radio"
                    name="theme"
                    value={theme.id}
                    checked={draft.theme === theme.id}
                    onChange={() => setDraft({ ...draft, theme: theme.id })}
                  />
                  <span className={`theme-option__swatch theme-option__swatch--${theme.id}`} aria-hidden="true">
                    <span />
                    <span />
                    <span />
                  </span>
                  <span className="theme-option__name">{theme.name}</span>
                  <span className="theme-option__note">{theme.note}</span>
                </label>
              ))}
            </div>
          </section>

          <section className="settings__section">
            <h3 className="settings__section-title">Her collections</h3>
            <div className="settings__collections">
              <div className="settings__collection">
                <p className="settings__collection-value">{photos.length}</p>
                <p className="settings__collection-label">photographs</p>
                <button type="button" className="linkish" onClick={() => goTo('diary')}>
                  Open her diary
                </button>
              </div>
              <div className="settings__collection">
                <p className="settings__collection-value">{milestones.length}</p>
                <p className="settings__collection-label">milestones</p>
                <button type="button" className="linkish" onClick={() => goTo('adventures')}>
                  Open her adventures
                </button>
              </div>
            </div>
          </section>

          <section className="settings__section settings__section--danger">
            <h3 className="settings__section-title">The first day</h3>
            <p className="settings__hint">
              Start again from a blank house. Everything saved in this browser will be removed.
            </p>
            <button type="button" className="btn btn--danger-quiet" onClick={resetHouse}>
              <TrashIcon className="icon" />
              Reset her house
            </button>
          </section>

          <p className="settings__privacy">
            <LeafIcon className="icon" />
            This is a static website. Her photographs, milestones and settings live only in this
            browser&rsquo;s local storage &mdash; nothing is sent to a server.
          </p>
        </div>

        <footer className="settings__foot">
          {error ? (
            <p className="form__error settings__error" role="alert">
              {error}
            </p>
          ) : null}
          <div className="settings__foot-actions">
            <button type="button" className="btn btn--ghost" onClick={closeSettings}>
              Cancel
            </button>
            <button type="button" className="btn btn--primary" onClick={save}>
              Save changes
            </button>
          </div>
        </footer>
      </div>
    </div>
  );
}
