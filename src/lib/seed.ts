import type { PhotoMeta, Profile, Theme } from './types';

export const DEFAULT_PROFILE: Profile = {
  name: 'Aphrodite',
  birthDate: '2025-10-06',
  birthTime: '12:00',
  timeZone: 'Asia/Kolkata',
  timeEstimated: true,
  species: '',
  favouriteFoods: '',
  personality: '',
  description: '',
  notes: '',
  portraitPhotoId: null,
  theme: 'botanical',
};

export const THEMES: { id: Theme; name: string; note: string }[] = [
  { id: 'botanical', name: 'Botanical', note: 'Cream paper, moss and soft gold' },
  { id: 'sunlit', name: 'Sunlit', note: 'Warmer paper, stronger sunlight' },
  { id: 'dusk', name: 'Dusk', note: 'Cooler greens, evening quiet' },
];

/** Small original SVG plates, so the diary has something to show before her photographs arrive. */
function plate(inner: string, width: number, height: number, ground: string): string {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
    <rect width="${width}" height="${height}" fill="${ground}"/>
    <rect x="18" y="18" width="${width - 36}" height="${height - 36}" fill="none" stroke="#806348" stroke-opacity=".28"/>
    <g font-family="Georgia, serif" fill="#806348" font-size="13" letter-spacing="3">
      <text x="42" y="${height - 52}">APHRODITE</text>
      <text x="42" y="${height - 34}" font-size="10" letter-spacing="2" fill-opacity=".65">STUDY No. 1</text>
    </g>
    ${inner}
  </svg>`;
  return `data:image/svg+xml,${encodeURIComponent(svg)}`;
}

const fernPlate = plate(
  `<g stroke="#526B40" fill="none" stroke-linecap="round">
     <path d="M300 430 C296 320 288 220 300 120" stroke-width="3"/>
     ${Array.from({ length: 13 })
       .map((_, i) => {
         const y = 150 + i * 21;
         const len = 92 - i * 4;
         return `<path d="M298 ${y} C${298 - len * 0.55} ${y - 26}, ${298 - len * 0.85} ${y - 6}, ${298 - len} ${y + 20}" stroke-width="2"/>
                 <path d="M302 ${y + 7} C${302 + len * 0.55} ${y - 19}, ${302 + len * 0.85} ${y + 1}, ${302 + len} ${y + 27}" stroke-width="2"/>`;
       })
       .join('')}
   </g>
   <circle cx="300" cy="120" r="5" fill="#D9B878"/>`,
  600,
  800,
  '#EFE9D8',
);

const shellPlate = plate(
  `<g transform="translate(300 330)">
     <ellipse cx="0" cy="40" rx="150" ry="22" fill="#183D2B" opacity=".10"/>
     <path d="M-128 30 C-136 -52 -70 -104 0 -104 C74 -104 138 -52 130 30 Z" fill="#E3DCC4" stroke="#526B40" stroke-width="3"/>
     <path d="M-128 30 C-136 -52 -70 -104 0 -104 C74 -104 138 -52 130 30 Z" fill="none" stroke="#294B36" stroke-width="3"/>
     <g fill="none" stroke="#806348" stroke-width="2" opacity=".8">
       <path d="M-92 0 C-70 -56 0 -86 0 -86 C0 -86 70 -56 92 0"/>
       <path d="M-70 -50 L-30 -14 L-60 20 M0 -86 L0 -20 M70 -50 L30 -14 L60 20"/>
       <path d="M-128 24 C-80 8 -40 8 0 8 C40 8 80 8 128 24"/>
     </g>
     <g fill="#A4B58A" opacity=".45">
       <path d="M-54 -18 l34 -26 l30 24 l-14 30 l-36 4z"/>
       <path d="M30 -46 l30 18 l-4 28 l-28 -8z"/>
     </g>
     <path d="M-128 30 C-40 42 40 42 130 30" stroke="#294B36" stroke-width="3" fill="none"/>
   </g>`,
  600,
  800,
  '#F1EBD9',
);

const mossPlate = plate(
  `<g transform="translate(0 0)">
     <path d="M60 560 C120 470 200 470 260 520 C320 430 420 420 500 500 C540 470 580 480 600 520 L600 800 L0 800 Z" fill="#526B40" opacity=".22"/>
     <path d="M0 640 C90 590 170 620 240 660 C330 600 430 610 540 680 C570 700 590 720 600 740 L600 800 L0 800 Z" fill="#294B36" opacity=".55"/>
     <g fill="none" stroke="#526B40" stroke-width="2" opacity=".85">
       ${Array.from({ length: 30 })
         .map((_, i) => {
           const x = 60 + (i % 10) * 52;
           const y = 620 + Math.floor(i / 10) * 48;
           return `<path d="M${x} ${y} q6 -34 18 -46 M${x + 6} ${y - 12} q16 -10 24 -2 M${x + 8} ${y - 24} q-12 -12 -22 -8"/>`;
         })
         .join('')}
     </g>
     <g fill="#D9B878" opacity=".8">
       <circle cx="180" cy="520" r="9"/><circle cx="186" cy="524" r="4" fill="#806348"/>
       <circle cx="430" cy="560" r="7"/><circle cx="436" cy="564" r="3" fill="#806348"/>
     </g>
     <g fill="#183D2B" opacity=".55">
       <ellipse cx="300" cy="720" rx="52" ry="20"/>
       <ellipse cx="320" cy="704" rx="34" ry="24"/>
     </g>
   </g>`,
  600,
  600,
  '#E5EBD9',
);

export function seededPhotos(): PhotoMeta[] {
  return [
    {
      id: 'plate-fern',
      caption: 'Pressed fern — a study in green',
      date: '2025-10-06',
      category: 'Growing Up',
      note: 'A small illustration that came with the house. Replace it with her first photograph whenever you like.',
      width: 600,
      height: 800,
      createdAt: 0,
      src: fernPlate,
    },
    {
      id: 'plate-shell',
      caption: 'Her shell, in quiet watercolour',
      date: '2025-11-06',
      category: 'Favourite Moments',
      note: 'An illustration of the pattern on her shell — every scute a little map of her life.',
      width: 600,
      height: 800,
      createdAt: 0,
      src: shellPlate,
    },
    {
      id: 'plate-moss',
      caption: 'Morning light on the moss',
      date: '2026-04-06',
      category: 'Everyday Aphrodite',
      note: 'A study of her kingdom floor, where the small adventures happen.',
      width: 600,
      height: 600,
      createdAt: 0,
      src: mossPlate,
    },
  ];
}
