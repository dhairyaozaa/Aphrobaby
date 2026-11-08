import { useCallback, useEffect, useRef, useState } from 'react';
import { useStore } from '../state/Store';
import { CloseIcon, LeafIcon } from './Icons';
import { SectionHeading } from './SectionHeading';
import { HabitatScene } from './HabitatScene';

interface Discovery {
  id: string;
  label: string;
  eyebrow: string;
  title: string;
  text: string;
  className: string;
}

const DISCOVERIES: Discovery[] = [
  {
    id: 'fern',
    label: 'The fern',
    eyebrow: 'A shady corner',
    title: 'Her favourite hiding place',
    text: 'The ferns keep the morning cool long after the sun has moved on. If she is quiet for a while, this is usually where she is — half under a frond, listening to the house.',
    className: 'kingdom__hotspot--fern',
  },
  {
    id: 'stone',
    label: 'The basking stone',
    eyebrow: 'Warm stone',
    title: 'Where the light collects',
    text: 'A flat grey stone that holds the afternoon heat. She stretches out along it, one back leg at a time, and lets the warmth do the slow work of being a tortoise.',
    className: 'kingdom__hotspot--stone',
  },
  {
    id: 'flower',
    label: 'The wildflower',
    eyebrow: 'Small extravagance',
    title: 'A flower taller than she is',
    text: 'It grows against the little hill and bends in the smallest breeze. She inspects it most mornings, with the serious expression of a creature checking that everything is still where it should be.',
    className: 'kingdom__hotspot--flower',
  },
];

const OBSERVATIONS = [
  'A cabbage leaf, left at the edge of the moss, is gone by evening.',
  'The sunlight moves across her shell a handspan every hour.',
  'A small snail has taken up residence beneath the basking stone.',
  'She has walked the same six inches three times this morning, each one deliberate.',
  'The ferns are new. She has not decided what she thinks of them yet.',
  'A butterfly stayed for eleven seconds. It was, by her standards, an event.',
];

export function Kingdom() {
  const { profile } = useStore();
  const frameRef = useRef<HTMLDivElement>(null);
  const [noteIndex, setNoteIndex] = useState<number | null>(null);
  const [observation, setObservation] = useState(0);
  const [immersive, setImmersive] = useState(false);

  useEffect(() => {
    if (!immersive) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setImmersive(false);
    };
    document.addEventListener('keydown', onKeyDown);
    document.body.classList.add('immersive-open');
    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.body.classList.remove('immersive-open');
    };
  }, [immersive]);

  const handleMove = useCallback((event: React.MouseEvent<HTMLDivElement>) => {
    if (!frameRef.current) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const rect = event.currentTarget.getBoundingClientRect();
    const x = (event.clientX - rect.left) / rect.width - 0.5;
    const y = (event.clientY - rect.top) / rect.height - 0.5;
    frameRef.current.style.setProperty('--mx', x.toFixed(3));
    frameRef.current.style.setProperty('--my', y.toFixed(3));
  }, []);

  const handleLeave = useCallback(() => {
    frameRef.current?.style.setProperty('--mx', '0');
    frameRef.current?.style.setProperty('--my', '0');
  }, []);

  const discover = () => {
    setObservation((current) => (current + 1) % OBSERVATIONS.length);
    setNoteIndex(null);
  };

  return (
    <section
      id="kingdom"
      className={`section kingdom${immersive ? ' kingdom--immersive' : ''}`}
      aria-labelledby="kingdom-title"
    >
      {immersive ? (
        <div className="kingdom__bar">
          <div className="kingdom__bar-title">
            <LeafIcon className="icon" />
            <span>{profile.name}&rsquo;s Little Kingdom</span>
          </div>
          <button type="button" className="btn btn--soft" onClick={() => setImmersive(false)}>
            <CloseIcon className="icon" />
            Leave her kingdom
          </button>
        </div>
      ) : null}

      <div className="container kingdom__container">
        {!immersive ? (
          <SectionHeading
            eyebrow="Her Little Kingdom"
            title="A world four steps wide"
            id="kingdom-title"
            lede="Moss, warmth, small stones and weather. Everything here is scaled to her — a habitat built from the things a tortoise actually cares about."
            action={
              <button type="button" className="btn btn--primary" onClick={() => setImmersive(true)}>
                <LeafIcon className="icon" />
                Visit Her Kingdom
              </button>
            }
          />
        ) : null}

        <div
          className="kingdom__frame"
          ref={frameRef}
          onMouseMove={handleMove}
          onMouseLeave={handleLeave}
          onClick={discover}
        >
          <HabitatScene variant="kingdom" onDiscover={discover} discoverLabel="Bend down and look" />

          <div className="kingdom__hotspots">
            {DISCOVERIES.map((discovery, index) => (
              <button
                key={discovery.id}
                type="button"
                className={`kingdom__hotspot ${discovery.className}`}
                onClick={(event) => {
                  event.stopPropagation();
                  setNoteIndex(index);
                }}
                aria-label={`Discover more about ${discovery.label.toLowerCase()}`}
              >
                <span className="kingdom__hotspot-pulse" aria-hidden="true" />
                <span className="kingdom__hotspot-label">{discovery.label}</span>
              </button>
            ))}
          </div>

          <div className="kingdom__hint">
            <p className="kingdom__observation">&ldquo;{OBSERVATIONS[observation]}&rdquo;</p>
            <p className="kingdom__hint-small">Move across the habitat to shift the light.</p>
          </div>

          {noteIndex !== null ? (
            <aside className="kingdom__note" aria-live="polite" onClick={(event) => event.stopPropagation()}>
              <button
                type="button"
                className="icon-btn kingdom__note-close"
                onClick={() => setNoteIndex(null)}
                aria-label="Close discovery"
              >
                <CloseIcon />
              </button>
              <p className="eyebrow">{DISCOVERIES[noteIndex].eyebrow}</p>
              <h3>{DISCOVERIES[noteIndex].title}</h3>
              <p>{DISCOVERIES[noteIndex].text}</p>
            </aside>
          ) : null}
        </div>

        <div className="kingdom__foot">
          <p>
            Her kingdom is alive with small weather: dust in the sunbeams, grass that leans into the
            breeze, and a tortoise who crosses it at her own pace. Use the gold marks to look closer.
          </p>
          {!immersive ? (
            <button type="button" className="btn btn--ghost" onClick={() => setImmersive(true)}>
              Step inside
            </button>
          ) : null}
        </div>
      </div>
    </section>
  );
}
