import { useMemo } from 'react';
import { Butterfly, Fern, Flower, GrassTuft, Stone, Tortoise } from './art';

interface HabitatSceneProps {
  variant: 'hero' | 'kingdom';
  wander?: boolean;
  onDiscover?: () => void;
  discoverLabel?: string;
}

interface Particle {
  left: number;
  top: number;
  size: number;
  delay: number;
  duration: number;
  drift: number;
}

function makeParticles(count: number): Particle[] {
  let seed = 20251006;
  const random = () => {
    seed = (seed * 1103515245 + 12345) % 2147483648;
    return seed / 2147483648;
  };
  return Array.from({ length: count }, () => ({
    left: random() * 100,
    top: 24 + random() * 62,
    size: 1.5 + random() * 3,
    delay: random() * 18,
    duration: 14 + random() * 16,
    drift: -30 + random() * 60,
  }));
}

/** The shared miniature habitat: moss ground, ferns, stones, sun and a wandering tortoise. */
export function HabitatScene({ variant, wander = false, onDiscover, discoverLabel }: HabitatSceneProps) {
  const particles = useMemo(() => makeParticles(variant === 'hero' ? 18 : 24), [variant]);

  return (
    <div className={`scene scene--${variant}`} aria-hidden={onDiscover ? undefined : true}>
      <div className="scene__sky" />
      <div className="scene__sun" />
      <div className="scene__haze" />
      <div className="scene__canopy">
        <span className="scene__leaf scene__leaf--1" />
        <span className="scene__leaf scene__leaf--2" />
        <span className="scene__leaf scene__leaf--3" />
        <span className="scene__leaf scene__leaf--4" />
      </div>

      <div className="scene__far">
        <Fern className="scene__fern scene__fern--far-a" />
        <Fern className="scene__fern scene__fern--far-b" />
        <Fern className="scene__fern scene__fern--far-c" />
      </div>

      <div className="scene__ground" />
      <div className="scene__moss">
        <div className="scene__moss-texture" />
      </div>

      <div className="scene__mid">
        <div className="scene__stones">
          <Stone className="scene__stone scene__stone--big" />
          <Stone className="scene__stone scene__stone--small" />
        </div>
        <GrassTuft className="scene__grass scene__grass--1" />
        <GrassTuft className="scene__grass scene__grass--2" />
        <GrassTuft className="scene__grass scene__grass--3" />
        <Fern className="scene__fern scene__fern--left" />
        <Fern className="scene__fern scene__fern--right" />
        <Flower className="scene__flower scene__flower--1" />
        <Flower className="scene__flower scene__flower--2" />
        <Flower className="scene__flower scene__flower--3" />
      </div>

      <div className="scene__tortoise">
        <Tortoise className="scene__tortoise-art" />
      </div>

      {wander ? (
        <div className="scene__wanderer">
          <Tortoise className="scene__wanderer-art" title="A small tortoise wandering across the moss" />
        </div>
      ) : null}

      <div className="scene__particles">
        {particles.map((particle, index) => (
          <span
            key={index}
            className="scene__particle"
            style={{
              left: `${particle.left}%`,
              top: `${particle.top}%`,
              width: `${particle.size}px`,
              height: `${particle.size}px`,
              animationDelay: `${-particle.delay}s`,
              animationDuration: `${particle.duration}s`,
              ['--drift' as string]: `${particle.drift}px`,
            }}
          />
        ))}
      </div>

      <div className="scene__butterflies">
        <Butterfly className="scene__butterfly scene__butterfly--a" />
        <Butterfly className="scene__butterfly scene__butterfly--b" />
      </div>

      {onDiscover ? (
        <button
          type="button"
          className="scene__discover"
          onClick={(event) => {
            event.stopPropagation();
            onDiscover();
          }}
        >
          {discoverLabel ?? 'Look closer'}
        </button>
      ) : null}
    </div>
  );
}
