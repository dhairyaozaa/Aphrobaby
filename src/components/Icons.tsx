interface IconProps {
  className?: string;
}

const base = {
  xmlns: 'http://www.w3.org/2000/svg',
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.5,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
  'aria-hidden': true,
  focusable: false,
};

export function SettingsIcon({ className }: IconProps) {
  return (
    <svg {...base} className={className}>
      <circle cx="12" cy="12" r="3.2" />
      <path d="M12 2.8v2.4M12 18.8v2.4M4.4 7.9l2 1.2M17.6 15l2 1.2M4.4 16.1l2-1.2M17.6 9l2-1.2" />
    </svg>
  );
}

export function CloseIcon({ className }: IconProps) {
  return (
    <svg {...base} className={className}>
      <path d="M6 6l12 12M18 6L6 18" />
    </svg>
  );
}

export function PrintIcon({ className }: IconProps) {
  return (
    <svg {...base} className={className}>
      <path d="M7 8V3.5h10V8" />
      <rect x="3.5" y="8" width="17" height="9" rx="1.6" />
      <path d="M7 14h10v6.5H7z" />
      <path d="M17.5 11h.01" />
    </svg>
  );
}

export function MenuIcon({ className }: IconProps) {
  return (
    <svg {...base} className={className}>
      <path d="M4 7h16M4 12h16M4 17h10" />
    </svg>
  );
}

export function PlusIcon({ className }: IconProps) {
  return (
    <svg {...base} className={className}>
      <path d="M12 5v14M5 12h14" />
    </svg>
  );
}

export function EditIcon({ className }: IconProps) {
  return (
    <svg {...base} className={className}>
      <path d="M16.5 3.9a2.1 2.1 0 0 1 3 3L8.2 18.2 4 19.5l1.3-4.2z" />
    </svg>
  );
}

export function TrashIcon({ className }: IconProps) {
  return (
    <svg {...base} className={className}>
      <path d="M4 7h16M9 7V4.8h6V7M6.5 7l.9 12.2h9.2L17.5 7M10 11v5M14 11v5" />
    </svg>
  );
}

export function ChevronLeftIcon({ className }: IconProps) {
  return (
    <svg {...base} className={className}>
      <path d="M14.5 5.5L8 12l6.5 6.5" />
    </svg>
  );
}

export function ChevronRightIcon({ className }: IconProps) {
  return (
    <svg {...base} className={className}>
      <path d="M9.5 5.5L16 12l-6.5 6.5" />
    </svg>
  );
}

export function CameraIcon({ className }: IconProps) {
  return (
    <svg {...base} className={className}>
      <path d="M3.5 8.5h3l1.4-2.2h8.2l1.4 2.2h3v10h-17z" />
      <circle cx="12" cy="13.2" r="3.4" />
    </svg>
  );
}

export function LeafIcon({ className }: IconProps) {
  return (
    <svg {...base} className={className}>
      <path d="M20 4C10.5 4 4.5 8.3 4.5 14.2 4.5 17 6.4 19.5 9.4 19.5 15.2 19.5 19 13.4 20 4Z" />
      <path d="M4.5 20c1.6-5.8 5.5-9.4 11-12.3" />
    </svg>
  );
}

export function SunIcon({ className }: IconProps) {
  return (
    <svg {...base} className={className}>
      <circle cx="12" cy="12" r="4.1" />
      <path d="M12 2.6v2.2M12 19.2v2.2M2.6 12h2.2M19.2 12h2.2M5.4 5.4l1.6 1.6M17 17l1.6 1.6M18.6 5.4L17 7M7 17l-1.6 1.6" />
    </svg>
  );
}

export function SeedlingIcon({ className }: IconProps) {
  return (
    <svg {...base} className={className}>
      <path d="M12 21v-8.4" />
      <path d="M12 12.6C9.3 12.6 5.5 11 5.5 6.4c4.4 0 6.5 2.1 6.5 6.2Z" />
      <path d="M12 12.6c2.7 0 6.5-1.6 6.5-6.2-4.4 0-6.5 2.1-6.5 6.2Z" />
    </svg>
  );
}

export function CakeIcon({ className }: IconProps) {
  return (
    <svg {...base} className={className}>
      <path d="M4 20h16M5 20v-6.2c0-1 .8-1.8 1.8-1.8h10.4c1 0 1.8.8 1.8 1.8V20" />
      <path d="M5 15.4c1.5 0 1.5 1.2 3 1.2s1.5-1.2 3-1.2 1.5 1.2 3 1.2 1.5-1.2 3-1.2 1.5 1.2 2 1.2" />
      <path d="M12 12V9.6M12 6.4c.9-.6 1.4-1.3 1.4-2.4" />
    </svg>
  );
}

export function StarIcon({ className, filled = false }: IconProps & { filled?: boolean }) {
  return (
    <svg {...base} className={className} fill={filled ? 'currentColor' : 'none'}>
      <path d="M12 3.8l2.5 5.1 5.5.8-4 3.9 1 5.6-5-2.7-5 2.7 1-5.6-4-3.9 5.5-.8z" />
    </svg>
  );
}

export function UploadIcon({ className }: IconProps) {
  return (
    <svg {...base} className={className}>
      <path d="M12 16V4M7.5 8.5L12 4l4.5 4.5M4 16v3.5h16V16" />
    </svg>
  );
}

export function ArrowDownIcon({ className }: IconProps) {
  return (
    <svg {...base} className={className}>
      <path d="M12 4v15M6 13.5l6 6 6-6" />
    </svg>
  );
}

export function ClockIcon({ className }: IconProps) {
  return (
    <svg {...base} className={className}>
      <circle cx="12" cy="12.5" r="8.2" />
      <path d="M12 8v4.8l3.2 1.9M9 3h6" />
    </svg>
  );
}

export function PencilLeafIcon({ className }: IconProps) {
  return (
    <svg {...base} className={className}>
      <path d="M5 19c0-7 4-11.5 11-12.5C15.5 13.5 11 17.5 5 19Z" />
      <path d="M5 19c2-4.5 5-7.5 9-9.5" />
    </svg>
  );
}
