import { useId } from 'react';

/* ------------------------------------------------------------------ */
/* Small botanical illustrations, drawn as original vector artwork.    */
/* ------------------------------------------------------------------ */

export function Logo({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 48 48"
      role="img"
      aria-label="Aphrodite's Digital House emblem"
      xmlns="http://www.w3.org/2000/svg"
    >
      <circle cx="24" cy="24" r="22.5" fill="none" stroke="currentColor" strokeWidth="1" opacity=".55" />
      <path d="M11 31c1.6 5 6.4 8 13 8s11.4-3 13-8z" fill="currentColor" opacity=".22" />
      <path d="M13 30c0-7.2 4.9-12 11-12s11 4.8 11 12z" fill="currentColor" opacity=".72" />
      <path d="M17.5 25.5l3-3.6 3.2 3 3.3-3.6 3 4.2" fill="none" stroke="var(--forest, #183D2B)" strokeWidth="1.1" opacity=".65" />
      <circle cx="36.5" cy="31" r="4.4" fill="currentColor" />
      <circle cx="37.9" cy="29.8" r=".9" fill="var(--forest, #183D2B)" />
      <path d="M15 31h20" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
      <path d="M24 8.5c-2.8 3-3.5 5.6-2.4 8.2 2.9-.6 4.1-2.9 2.4-8.2z" fill="currentColor" opacity=".45" />
    </svg>
  );
}

interface TortoiseProps {
  className?: string;
  title?: string;
}

/** A side-on baby tortoise, drawn with layered shell plates and soft sunlight. */
export function Tortoise({ className, title = 'Aphrodite, a small tortoise' }: TortoiseProps) {
  const uid = useId().replace(/[:]/g, '');
  const shell = `shell-${uid}`;
  const skin = `skin-${uid}`;
  const gold = `gold-${uid}`;
  const rim = `rim-${uid}`;

  return (
    <svg
      className={className}
      viewBox="0 0 240 160"
      role="img"
      aria-label={title}
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id={shell} x1="0.25" y1="0" x2="0.75" y2="1">
          <stop offset="0%" stopColor="#8A9B60" />
          <stop offset="42%" stopColor="#526B40" />
          <stop offset="100%" stopColor="#294B36" />
        </linearGradient>
        <linearGradient id={skin} x1="0" y1="0" x2="0.3" y2="1">
          <stop offset="0%" stopColor="#CDBF95" />
          <stop offset="55%" stopColor="#A8996C" />
          <stop offset="100%" stopColor="#7C6C46" />
        </linearGradient>
        <linearGradient id={rim} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#9B7C52" />
          <stop offset="100%" stopColor="#6D5436" />
        </linearGradient>
        <linearGradient id={gold} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#F0DDAE" stopOpacity=".85" />
          <stop offset="100%" stopColor="#D9B878" stopOpacity="0" />
        </linearGradient>
      </defs>

      {/* ground shadow */}
      <ellipse cx="120" cy="141" rx="82" ry="10" fill="#183D2B" opacity=".22" />

      {/* back leg */}
      <path
        className="tortoise__leg tortoise__leg--back"
        d="M162 112c14-3 27 4 29 15 2 9-6 15-17 13-10-1-17-6-21-13z"
        fill={`url(#${skin})`}
        stroke="#6A5A3A"
        strokeWidth="1.5"
      />
      <g stroke="#6A5A3A" strokeWidth="1.1" opacity=".55" strokeLinecap="round">
        <path d="M174 136v4M180 137v4M186 137v3" />
      </g>

      {/* tail */}
      <path
        d="M193 107c10 2 17 7 16 13-1 5-8 7-15 2z"
        fill={`url(#${skin})`}
        stroke="#6A5A3A"
        strokeWidth="1.4"
      />

      {/* front leg */}
      <path
        className="tortoise__leg tortoise__leg--front"
        d="M73 107c-11 3-20 12-19 22 1 9 9 12 18 8 9-5 14-13 16-22z"
        fill={`url(#${skin})`}
        stroke="#6A5A3A"
        strokeWidth="1.5"
      />
      <g stroke="#6A5A3A" strokeWidth="1.1" opacity=".55" strokeLinecap="round">
        <path d="M60 133v4M66 132v4M72 130v3" />
      </g>

      {/* neck */}
      <path
        d="M58 80c10 1 18 7 21 17l-9 15c-8-3-15-8-20-15z"
        fill={`url(#${skin})`}
        stroke="#6A5A3A"
        strokeWidth="1.4"
      />
      <g stroke="#7C6C46" strokeWidth="1.1" fill="none" opacity=".5">
        <path d="M62 87c4 4 6 8 6 13M70 84c4 4 6 9 6 14" />
      </g>

      {/* head */}
      <path
        d="M62 83C49 73 31 75 22 85c-9 10-6 24 8 30 14 6 31 4 39-6 6-8 3-19-7-26z"
        fill={`url(#${skin})`}
        stroke="#6A5A3A"
        strokeWidth="1.6"
      />
      {/* cheek shading */}
      <path d="M58 92c8 5 11 12 9 20-6-1-11-4-14-9z" fill="#8E7E55" opacity=".35" />
      {/* eye */}
      <ellipse cx="38" cy="92" rx="3.7" ry="4.1" fill="#20281B" />
      <circle cx="36.7" cy="90.5" r="1.25" fill="#F6EFD9" opacity=".92" />
      <path d="M31 85c4-2 9-1.6 13 .6" stroke="#6A5A3A" strokeWidth="1.2" fill="none" opacity=".65" strokeLinecap="round" />
      <circle cx="26" cy="95" r="1" fill="#6A5A3A" />
      {/* mouth */}
      <path d="M22 103c4 3.4 9 4 14 1.6" stroke="#63532F" strokeWidth="1.6" fill="none" strokeLinecap="round" />
      {/* neck scales */}
      <g fill="none" stroke="#7C6C46" strokeWidth="1" opacity=".45" strokeLinecap="round">
        <path d="M48 104q4 2 7 0M44 99q4 2 7 0M40 94q3 2 6 0" />
      </g>

      {/* shell dome */}
      <path
        d="M38 108C32 66 66 38 116 38c54 0 88 28 84 70-28 14-134 14-162 0z"
        fill={`url(#${shell})`}
        stroke="#23422F"
        strokeWidth="2.4"
      />
      <path
        d="M44 100C44 68 72 46 112 44"
        stroke={`url(#${gold})`}
        strokeWidth="3.4"
        fill="none"
        strokeLinecap="round"
      />

      {/* shell plates */}
      <g stroke="#1D3A28" strokeOpacity=".6" strokeWidth="1.9" strokeLinejoin="round">
        <path d="M98 47h44l12 24-12 18H98L86 71z" fill="#66804C" fillOpacity=".6" />
        <path d="M63 63l25-11-5 20 3 17-25-6-9-11z" fill="#5B7444" fillOpacity=".55" />
        <path d="M177 63l-25-11 5 20-3 17 25-6 9-11z" fill="#5B7444" fillOpacity=".55" />
        <path d="M88 82h64l-7 20H95z" fill="#4C6640" fillOpacity=".6" />
        <path d="M50 92l20-5 4 15-19 7-11-9z" fill="#48603C" fillOpacity=".5" />
        <path d="M190 92l-20-5-4 15 19 7 11-9z" fill="#48603C" fillOpacity=".5" />
      </g>
      <g fill="none" stroke="#B9C48F" strokeOpacity=".28" strokeWidth="1.4" strokeLinecap="round">
        <path d="M100 50h40M100 79h40M71 67l12 5M169 67l-12 5" />
      </g>

      {/* shell rim */}
      <path
        d="M38 106c30 13 128 13 162 0l-3 10c-35 12-123 12-156 0z"
        fill={`url(#${rim})`}
        stroke="#4E3B24"
        strokeWidth="1.2"
      />
      <path d="M38 106c30 13 128 13 162 0" stroke="#D9B878" strokeOpacity=".5" strokeWidth="1.4" fill="none" />
      <g stroke="#4E3B24" strokeOpacity=".55" strokeWidth="1.1">
        <path d="M60 110v6M84 113v6M110 115v6M136 115v6M162 113v6M186 110v6" />
      </g>
    </svg>
  );
}

export function Fern({ className }: { className?: string }) {
  const fronds = Array.from({ length: 11 }, (_, i) => {
    const y = 66 + i * 11.5;
    const length = 44 - i * 2.4;
    return { y, length, i };
  });

  return (
    <svg
      className={className}
      viewBox="0 0 140 200"
      aria-hidden="true"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M70 199C67 158 65 110 72 44c3-26 1-32 1-32" fill="none" stroke="#3E5733" strokeWidth="2.6" strokeLinecap="round" />
      {fronds.map(({ y, length, i }) => (
        <g key={i} fill="none" strokeLinecap="round" strokeWidth={2.2 - i * 0.06}>
          <path
            d={`M71 ${y} C${71 - length * 0.38} ${y - 12}, ${71 - length * 0.78} ${y - 5}, ${71 - length} ${y + 10}`}
            stroke="#6E8550"
          />
          <path
            d={`M72 ${y + 4} C${72 + length * 0.38} ${y - 8}, ${72 + length * 0.78} ${y - 1}, ${72 + length} ${y + 14}`}
            stroke="#526B40"
          />
          <path
            d={`M71 ${y} C${71 - length * 0.3} ${y - 16}, ${71 - length * 0.6} ${y - 12}, ${71 - length * 0.85} ${y - 2}`}
            stroke="#8FA36A"
            strokeOpacity=".5"
            strokeWidth="1"
          />
        </g>
      ))}
      <path d="M73 14c7-7 16-8 22-3-6 7-14 9-22 3z" fill="#7E9159" opacity=".85" />
    </svg>
  );
}

export function GrassTuft({ className }: { className?: string }) {
  const blades = Array.from({ length: 9 }, (_, i) => {
    const x = 8 + i * 4.6;
    const lean = (i % 3) * 6 - 6;
    const height = 30 + ((i * 7) % 22);
    return { x, lean, height, i };
  });
  return (
    <svg className={className} viewBox="0 0 52 62" aria-hidden="true" xmlns="http://www.w3.org/2000/svg">
      {blades.map(({ x, lean, height, i }) => (
        <path
          key={i}
          d={`M${x} 62C${x + lean * 0.2} ${62 - height * 0.5}, ${x + lean * 0.7} ${62 - height * 0.8}, ${x + lean} ${62 - height}`}
          fill="none"
          stroke={i % 2 === 0 ? '#526B40' : '#71874F'}
          strokeWidth={1.8 - (i % 3) * 0.2}
          strokeLinecap="round"
          opacity={0.75 + (i % 4) * 0.06}
        />
      ))}
    </svg>
  );
}

export function Stone({ className }: { className?: string }) {
  const uid = useId().replace(/[:]/g, '');
  return (
    <svg className={className} viewBox="0 0 120 70" aria-hidden="true" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id={`stone-${uid}`} x1=".2" y1="0" x2=".8" y2="1">
          <stop offset="0%" stopColor="#B9B39A" />
          <stop offset="55%" stopColor="#8E8974" />
          <stop offset="100%" stopColor="#625F4F" />
        </linearGradient>
      </defs>
      <ellipse cx="60" cy="63" rx="50" ry="6" fill="#183D2B" opacity=".18" />
      <path
        d="M8 52c-3-12 8-24 24-28 18-5 39 1 49 11 9 9 8 21-3 26-18 8-46 8-62 1-5-2-7-5-8-10z"
        fill={`url(#stone-${uid})`}
      />
      <path d="M18 40c8-12 26-18 43-16 10 1 18 4 24 9-12-3-25-4-37-1-12 3-21 8-30 8z" fill="#D7D2BC" opacity=".45" />
      <g fill="#526B40" opacity=".55">
        <path d="M24 48c2-6 7-9 12-9-2 5-6 8-12 9z" />
        <path d="M70 55c1-5 5-8 10-8-2 4-5 7-10 8z" />
      </g>
      <path d="M34 32c3-1 6-1 9 0M62 27c3 0 6 1 8 2" stroke="#6F6B59" strokeWidth="1" opacity=".5" fill="none" />
    </svg>
  );
}

export function Flower({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 40 60" aria-hidden="true" xmlns="http://www.w3.org/2000/svg">
      <path d="M20 58C19 44 20 36 21 28" fill="none" stroke="#526B40" strokeWidth="1.8" strokeLinecap="round" />
      <path d="M20 48c-7-1-10-4-11-9 6-1 10 3 11 9z" fill="#71874F" />
      <g transform="translate(21 19)">
        {[0, 72, 144, 216, 288].map((angle) => (
          <ellipse key={angle} cx="0" cy="-7" rx="4" ry="7" fill="#E4C98D" transform={`rotate(${angle})`} />
        ))}
        <circle cx="0" cy="0" r="3.4" fill="#C79A54" />
        <circle cx="0" cy="0" r="1.3" fill="#806348" />
      </g>
    </svg>
  );
}

export function Butterfly({ className }: { className?: string }) {
  const uid = useId().replace(/[:]/g, '');
  return (
    <svg className={className} viewBox="0 0 60 46" aria-hidden="true" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id={`wing-${uid}`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#E9D6A2" />
          <stop offset="100%" stopColor="#C79A54" />
        </linearGradient>
      </defs>
      <g fill={`url(#wing-${uid})`} stroke="#806348" strokeWidth="1">
        <path d="M29 23C22 10 10 4 5 10 0 16 8 26 29 23z" className="butterfly__wing butterfly__wing--left" />
        <path d="M31 23C38 10 50 4 55 10c5 6-3 16-24 13z" className="butterfly__wing butterfly__wing--right" />
        <path d="M29 25C21 27 14 35 18 39c4 4 10-1 11-14z" className="butterfly__wing butterfly__wing--left" opacity=".85" />
        <path d="M31 25c8 2 15 10 11 14-4 4-10-1-11-14z" className="butterfly__wing butterfly__wing--right" opacity=".85" />
      </g>
      <ellipse cx="30" cy="24" rx="1.8" ry="8" fill="#4B4030" />
      <path d="M29 16c-4-6-7-8-9-8M31 16c4-6 7-8 9-8" stroke="#4B4030" strokeWidth="1.1" fill="none" strokeLinecap="round" />
    </svg>
  );
}

/** A small pressed-sprig ornament used beside section titles. */
export function Sprig({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 120 40" aria-hidden="true" xmlns="http://www.w3.org/2000/svg">
      <path d="M4 30C34 30 68 24 112 10" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" opacity=".7" />
      {[0, 1, 2, 3, 4, 5].map((i) => {
        const x = 18 + i * 15;
        const y = 29 - i * 3.4;
        return (
          <g key={i} opacity={0.55 + i * 0.05}>
            <ellipse cx={x - 2} cy={y - 5} rx="7.5" ry="3" fill="currentColor" transform={`rotate(${-32 - i * 3} ${x} ${y})`} opacity=".55" />
            <ellipse cx={x + 3} cy={y - 1} rx="7.5" ry="3" fill="currentColor" transform={`rotate(${24 + i * 2} ${x} ${y})`} opacity=".4" />
          </g>
        );
      })}
    </svg>
  );
}

/** Original illustrated portrait, shown until a photograph is added. */
export function PortraitStudy({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 520 650" role="img" aria-label="An illustrated portrait of Aphrodite in her habitat" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="portrait-paper" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#F6F0DE" />
          <stop offset="100%" stopColor="#E5EBD9" />
        </linearGradient>
        <radialGradient id="portrait-sun" cx="0.28" cy="0.16" r="0.62">
          <stop offset="0%" stopColor="#F3E2B6" stopOpacity=".9" />
          <stop offset="100%" stopColor="#F3E2B6" stopOpacity="0" />
        </radialGradient>
      </defs>
      <rect width="520" height="650" fill="url(#portrait-paper)" />
      <rect x="18" y="18" width="484" height="614" fill="none" stroke="#806348" strokeOpacity=".3" />
      <rect x="28" y="28" width="464" height="594" fill="none" stroke="#806348" strokeOpacity=".16" />
      <rect width="520" height="650" fill="url(#portrait-sun)" />
      <ellipse cx="260" cy="560" rx="196" ry="30" fill="#183D2B" opacity=".08" />
      <path d="M0 540c70-42 130-58 200-46 80 14 150 8 210-24 42-23 80-22 110-10v190H0z" fill="#E5EBD9" />
      <path d="M0 566c72-34 128-44 196-32 82 14 152 4 212-26 42-22 78-20 112-6v148H0z" fill="#A4B58A" opacity=".55" />
      <path d="M0 600c82-26 150-30 214-18 80 15 148 4 208-20 40-16 72-15 98-4v92H0z" fill="#526B40" opacity=".5" />
      <g opacity=".8">
        <path d="M64 520C60 452 62 398 74 340" fill="none" stroke="#526B40" strokeWidth="2" />
        {Array.from({ length: 8 }, (_, i) => (
          <ellipse key={i} cx={72 - i * 0.5} cy={480 - i * 18} rx="22" ry="7" fill="#526B40" opacity=".45" transform={`rotate(${-38 - i * 2} ${72} ${480 - i * 18})`} />
        ))}
      </g>
      <g opacity=".65">
        <path d="M452 540c6-54 2-96-12-140" fill="none" stroke="#6E8550" strokeWidth="2" />
        {Array.from({ length: 7 }, (_, i) => (
          <ellipse key={i} cx={448 + i} cy={498 - i * 16} rx="20" ry="6" fill="#6E8550" opacity=".5" transform={`rotate(${32 + i * 2} ${448} ${498 - i * 16})`} />
        ))}
      </g>
      <g transform="translate(96 300) scale(1.32)">
        <Tortoise title="Illustrated portrait of Aphrodite" />
      </g>
      <g fill="#806348" fontFamily="Georgia, serif" letterSpacing="4">
        <text x="46" y="612" fontSize="15">APHRODITE</text>
        <text x="46" y="632" fontSize="10" opacity=".6" letterSpacing="3">A PORTRAIT STUDY · HER DIGITAL HOUSE</text>
      </g>
      <g stroke="#806348" strokeOpacity=".5">
        <path d="M420 596h54M420 604h54" />
      </g>
    </svg>
  );
}
