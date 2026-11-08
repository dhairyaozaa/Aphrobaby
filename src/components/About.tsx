import { computeAge, formatClockTime, formatDateLong } from '../lib/time';
import { useNow } from '../lib/ticker';
import { useStore } from '../state/Store';
import { PencilLeafIcon } from './Icons';
import { Logo, PortraitStudy, Sprig } from './art';
import { StoredImage } from './StoredImage';

export function About() {
  const { profile, openSettings, openKeepsake } = useStore();
  const now = useNow();
  const age = computeAge(
    { date: profile.birthDate, time: profile.birthTime, timeZone: profile.timeZone },
    now,
  );

  const facts = [
    { label: 'Born', value: formatDateLong(profile.birthDate) },
    {
      label: 'Birth time',
      value: `${formatClockTime(profile.birthTime)}${profile.timeEstimated ? ' (estimated)' : ''}`,
    },
    { label: 'Time zone', value: profile.timeZone },
    { label: 'Species', value: profile.species.trim() || 'Not yet recorded' },
    { label: 'Favourite foods', value: profile.favouriteFoods.trim() || 'Not yet recorded' },
    { label: 'Personality', value: profile.personality.trim() || 'Not yet recorded' },
  ];

  return (
    <section id="about" className="section about-section" aria-labelledby="about-title">
      <div className="container">
        <div className="about">
          <div className="about__visual">
            <div className="about__frame">
              {profile.portraitPhotoId ? (
                <StoredImage
                  photoId={profile.portraitPhotoId}
                  alt={`A portrait of ${profile.name}`}
                  className="about__portrait"
                  loading="lazy"
                />
              ) : (
                <PortraitStudy className="about__portrait about__portrait--illustrated" />
              )}
            </div>
            <p className="about__caption">
              <Sprig className="about__caption-sprig" />
              {age.valid
                ? `${profile.name} has been here for ${age.years} ${age.years === 1 ? 'year' : 'years'}, ${age.months} ${age.months === 1 ? 'month' : 'months'} and ${age.days} ${age.days === 1 ? 'day' : 'days'}.`
                : 'Her story is waiting for its first line.'}
            </p>
          </div>

          <div className="about__body">
            <p className="eyebrow">
              <Sprig className="eyebrow__sprig" />
              About Aphrodite
            </p>
            <h2 className="about__title" id="about-title">
              A small life,<br /> closely kept.
            </h2>
            <p className="about__lede">
              {profile.name} is a tortoise with a whole digital house to herself: a clock that never
              stops counting, a kingdom of moss and warm stone, and a diary kept by someone who
              notices.
            </p>

            <dl className="about__facts">
              {facts.map((fact) => (
                <div className="about__fact" key={fact.label}>
                  <dt>{fact.label}</dt>
                  <dd>{fact.value}</dd>
                </div>
              ))}
            </dl>

            <div className="about__story">
              <p className="about__story-label">In her own words &mdash; well, yours</p>
              {profile.description.trim() ? (
                <p className="about__story-text">{profile.description}</p>
              ) : (
                <p className="about__story-empty">
                  There is a page here for the things that do not fit in dates: how she holds her
                  head when she is thinking, the sound of her crossing the moss, the exact way she
                  likes her leaves. It is empty for now, waiting for you.
                </p>
              )}
              {profile.notes.trim() ? (
                <div className="about__notes">
                  <p className="about__notes-label">Notes for her keeper</p>
                  <p>{profile.notes}</p>
                </div>
              ) : null}
            </div>

            <button type="button" className="btn btn--primary" onClick={openSettings}>
              <PencilLeafIcon className="icon" />
              Edit her page
            </button>
          </div>
        </div>

        <aside className="keepsake-cta" aria-labelledby="keepsake-cta-title">
          <Logo className="keepsake-cta__mark" />
          <div className="keepsake-cta__text">
            <p className="eyebrow">A little forever</p>
            <h3 id="keepsake-cta-title">Her keepsake</h3>
            <p>
              A printable page with her portrait, her numbers and a few small chapters — something
              to keep beyond this browser.
            </p>
          </div>
          <button type="button" className="btn btn--primary" onClick={openKeepsake}>
            Open her keepsake
          </button>
        </aside>
      </div>
    </section>
  );
}
