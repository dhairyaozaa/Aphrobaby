import type { Milestone, MilestoneOverride, Profile } from './types';
import { addDaysISO, addMonthsISO, calendarDaysBetween, todayISO } from './time';

interface AutoSpec {
  id: string;
  kind: 'birth' | 'days' | 'months';
  amount: number;
  title: (name: string) => string;
  description: (name: string, label: string) => string;
}

const YEAR_WORDS = [
  'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten',
];

function birthdayTitle(years: number): string {
  if (years === 1) return 'First birthday';
  return `${YEAR_WORDS[years - 1]?.replace(/^./, (c) => c.toUpperCase()) ?? years} years old`;
}

function monthWord(months: number): string {
  if (months === 1) return 'one month';
  if (months === 3) return 'three months';
  if (months === 6) return 'six months';
  if (months === 9) return 'nine months';
  return `${months} months`;
}

const autoSpecs: AutoSpec[] = [
  {
    id: 'auto:birth',
    kind: 'days',
    amount: 0,
    title: () => 'The beginning of Aphrodite',
    description: (name) =>
      `The day ${name}'s little life began — the first page of this house, and the start of every second counted below.`,
  },
  {
    id: 'auto:week-one',
    kind: 'days',
    amount: 7,
    title: () => 'One week old',
    description: (name) => `Seven small days into the world. ${name} has begun to find her feet.`,
  },
  {
    id: 'auto:month-one',
    kind: 'months',
    amount: 1,
    title: () => 'One month old',
    description: (name) => `A whole month of ${name}. The house has settled into her rhythm.`,
  },
  {
    id: 'auto:month-three',
    kind: 'months',
    amount: 3,
    title: () => 'Three months old',
    description: (name) => `Three months of slow mornings and warm light for ${name}.`,
  },
  {
    id: 'auto:month-six',
    kind: 'months',
    amount: 6,
    title: () => 'Six months old',
    description: (name) => `Half a year, gathered quietly. ${name} is growing into her shell.`,
  },
  {
    id: 'auto:month-nine',
    kind: 'months',
    amount: 9,
    title: () => 'Nine months old',
    description: (name) => `Nine months of moss, sunlight and small adventures for ${name}.`,
  },
  {
    id: 'auto:days-100',
    kind: 'days',
    amount: 100,
    title: () => 'One hundred days',
    description: (name) => `One hundred days of ${name}. A small life, counted in every second.`,
  },
  {
    id: 'auto:days-500',
    kind: 'days',
    amount: 500,
    title: () => 'Five hundred days',
    description: (name) => `Five hundred days of ${name}'s quiet company.`,
  },
  {
    id: 'auto:days-1000',
    kind: 'days',
    amount: 1000,
    title: () => 'One thousand days',
    description: () => `One thousand days — a little forever, already.`,
  },
];

for (let years = 1; years <= 10; years += 1) {
  autoSpecs.push({
    id: `auto:year-${years}`,
    kind: 'months',
    amount: years * 12,
    title: () => birthdayTitle(years),
    description: (name, label) => `${name} turns ${label}. A birthday in her little kingdom.`,
  });
}

export const autoMilestoneCount = autoSpecs.length;

export function autoMilestones(profile: Profile): Milestone[] {
  const name = profile.name.trim() || 'Aphrodite';
  return autoSpecs.map((spec) => {
    const date =
      spec.kind === 'months'
        ? addMonthsISO(profile.birthDate, spec.amount)
        : addDaysISO(profile.birthDate, spec.amount);
    const label =
      spec.kind === 'months'
        ? spec.amount % 12 === 0
          ? `${spec.amount / 12} ${spec.amount === 12 ? 'year' : 'years'}`
          : monthWord(spec.amount % 12)
        : `${spec.amount} days`;
    return {
      id: spec.id,
      date,
      title: spec.id === 'auto:birth' ? `The beginning of ${name}` : spec.title(name),
      description: spec.description(name, label),
      photoId: null,
      special: spec.id === 'auto:birth' || spec.id === 'auto:year-1',
      auto: true,
    };
  });
}

/** Merge generated milestones with the keeper's own, applying edits and deletions. */
export function buildMilestones(
  profile: Profile,
  custom: Milestone[],
  overrides: Record<string, MilestoneOverride>,
): Milestone[] {
  const generated = autoMilestones(profile).map((milestone) => {
    const override = overrides[milestone.id];
    if (!override) return milestone;
    return {
      ...milestone,
      ...(override.title !== undefined ? { title: override.title } : {}),
      ...(override.description !== undefined ? { description: override.description } : {}),
      ...(override.date !== undefined ? { date: override.date } : {}),
      ...(override.special !== undefined ? { special: override.special } : {}),
      ...(override.photoId !== undefined ? { photoId: override.photoId } : {}),
    };
  }).filter((milestone) => !overrides[milestone.id]?.hidden);

  return [...generated, ...custom]
    .filter((milestone) => Boolean(milestone.date))
    .sort((a, b) => {
      if (a.date === b.date) {
        if (a.special !== b.special) return a.special ? -1 : 1;
        return a.title.localeCompare(b.title);
      }
      return a.date < b.date ? -1 : 1;
    });
}

export function groupLabel(date: string, today: string): 'past' | 'today' | 'future' {
  const diff = calendarDaysBetween(today, date);
  if (diff === 0) return 'today';
  return diff > 0 ? 'future' : 'past';
}

export function todayForProfile(profile: Profile): string {
  return todayISO(profile.timeZone);
}
