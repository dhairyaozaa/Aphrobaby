export type Theme = 'botanical' | 'sunlit' | 'dusk';

export interface Profile {
  name: string;
  birthDate: string;
  birthTime: string;
  timeZone: string;
  timeEstimated: boolean;
  species: string;
  favouriteFoods: string;
  personality: string;
  description: string;
  notes: string;
  portraitPhotoId: string | null;
  theme: Theme;
}

export interface Milestone {
  id: string;
  date: string;
  title: string;
  description: string;
  photoId: string | null;
  special: boolean;
  auto: boolean;
}

export interface MilestoneOverride {
  title?: string;
  description?: string;
  date?: string;
  special?: boolean;
  photoId?: string | null;
  hidden?: boolean;
}

export interface PhotoMeta {
  id: string;
  caption: string;
  date: string;
  category: string;
  note: string;
  width: number;
  height: number;
  createdAt: number;
  src?: string;
}

export interface ToastMessage {
  id: number;
  text: string;
  tone: 'default' | 'error';
}

export const CATEGORIES = [
  'Growing Up',
  'Little Adventures',
  'Favourite Moments',
  'Everyday Aphrodite',
  'Special Days',
] as const;

export const GALLERY_CATEGORY = 'Gallery';
