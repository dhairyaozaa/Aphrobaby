import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { DEFAULT_PROFILE, seededPhotos } from '../lib/seed';
import type {
  Milestone,
  MilestoneOverride,
  PhotoMeta,
  Profile,
  ToastMessage,
} from '../lib/types';
import { buildMilestones } from '../lib/milestones';
import {
  isValidDateString,
  isValidTimeString,
  isValidTimeZone,
  todayISO,
} from '../lib/time';
import {
  clearPhotoBlobs,
  clearPhotoObjectUrls,
  forgetPhotoObjectUrl,
  removePhotoBlob,
  savePhotoBlob,
} from '../lib/db';
import { preparePhotograph } from '../lib/image';

const KEYS = {
  profile: 'aphrodite.profile.v1',
  photos: 'aphrodite.photos.v1',
  custom: 'aphrodite.milestones.custom.v1',
  overrides: 'aphrodite.milestones.overrides.v1',
};

export interface ConfirmOptions {
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  danger?: boolean;
}

interface ConfirmRequest extends ConfirmOptions {
  id: number;
}

interface StoreValue {
  profile: Profile;
  photos: PhotoMeta[];
  customMilestones: Milestone[];
  overrides: Record<string, MilestoneOverride>;
  milestones: Milestone[];
  today: string;
  settingsOpen: boolean;
  openSettings: () => void;
  closeSettings: () => void;
  keepsakeOpen: boolean;
  openKeepsake: () => void;
  closeKeepsake: () => void;
  updateProfile: (patch: Partial<Profile>) => void;
  addPhotos: (files: File[], category: string, date: string) => Promise<{ added: number; failed: string[] }>;
  updatePhoto: (id: string, patch: Partial<PhotoMeta>) => void;
  deletePhoto: (id: string) => Promise<void>;
  setPortrait: (file: File | null) => Promise<void>;
  saveMilestonePhoto: (file: File) => Promise<string>;
  discardPhoto: (id: string) => Promise<void>;
  addMilestone: (input: Omit<Milestone, 'id' | 'auto'>) => void;
  updateMilestone: (id: string, patch: Partial<Milestone>) => void;
  deleteMilestone: (id: string) => Promise<void>;
  notify: (text: string, tone?: ToastMessage['tone']) => void;
  toasts: ToastMessage[];
  dismissToast: (id: number) => void;
  confirmAction: (options: ConfirmOptions) => Promise<boolean>;
  confirmState: ConfirmRequest | null;
  settleConfirm: (ok: boolean) => void;
  resetEverything: () => Promise<void>;
}

const StoreContext = createContext<StoreValue | null>(null);

function readJSON<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch (error) {
    console.warn(`Could not read ${key}`, error);
    return fallback;
  }
}

function writeJSON(key: string, value: unknown): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.warn(`Could not save ${key}. Storage may be full.`, error);
  }
}

function loadProfile(): Profile {
  const stored = readJSON<Partial<Profile>>(KEYS.profile, {});
  const profile: Profile = { ...DEFAULT_PROFILE, ...stored };
  if (!isValidDateString(profile.birthDate)) profile.birthDate = DEFAULT_PROFILE.birthDate;
  if (!isValidTimeString(profile.birthTime)) profile.birthTime = DEFAULT_PROFILE.birthTime;
  if (!isValidTimeZone(profile.timeZone)) profile.timeZone = DEFAULT_PROFILE.timeZone;
  if (!['botanical', 'sunlit', 'dusk'].includes(profile.theme)) profile.theme = 'botanical';
  profile.name = (profile.name || 'Aphrodite').trim().slice(0, 40) || 'Aphrodite';
  return profile;
}

function loadPhotos(): PhotoMeta[] {
  const raw = localStorage.getItem(KEYS.photos);
  if (!raw) return seededPhotos();
  const parsed = readJSON<PhotoMeta[]>(KEYS.photos, []);
  if (!Array.isArray(parsed)) return seededPhotos();
  return parsed
    .filter((photo): photo is PhotoMeta => Boolean(photo) && typeof photo.id === 'string')
    .map((photo) => ({
      ...photo,
      caption: typeof photo.caption === 'string' ? photo.caption : '',
      note: typeof photo.note === 'string' ? photo.note : '',
      date: isValidDateString(photo.date) ? photo.date : DEFAULT_PROFILE.birthDate,
      category: photo.category || 'Favourite Moments',
      width: Number(photo.width) || 1200,
      height: Number(photo.height) || 1200,
    }));
}

function loadCustomMilestones(): Milestone[] {
  const parsed = readJSON<Milestone[]>(KEYS.custom, []);
  if (!Array.isArray(parsed)) return [];
  return parsed
    .filter((item): item is Milestone => Boolean(item) && typeof item.id === 'string')
    .map((item) => ({
      ...item,
      title: item.title || 'A moment',
      description: item.description || '',
      photoId: item.photoId ?? null,
      special: Boolean(item.special),
      auto: false,
    }));
}

function loadOverrides(): Record<string, MilestoneOverride> {
  const parsed = readJSON<Record<string, MilestoneOverride>>(KEYS.overrides, {});
  return parsed && typeof parsed === 'object' ? parsed : {};
}

function newId(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return `id-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

export function StoreProvider({ children }: { children: ReactNode }) {
  const [profile, setProfile] = useState<Profile>(loadProfile);
  const [photos, setPhotos] = useState<PhotoMeta[]>(loadPhotos);
  const [customMilestones, setCustomMilestones] = useState<Milestone[]>(loadCustomMilestones);
  const [overrides, setOverrides] = useState<Record<string, MilestoneOverride>>(loadOverrides);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [keepsakeOpen, setKeepsakeOpen] = useState(false);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [confirmState, setConfirmState] = useState<ConfirmRequest | null>(null);

  const resolverRef = useRef<((ok: boolean) => void) | null>(null);
  const confirmId = useRef(0);
  const toastId = useRef(0);
  const toastTimers = useRef<number[]>([]);

  useEffect(() => {
    writeJSON(KEYS.profile, profile);
    document.documentElement.dataset.theme = profile.theme;
    document.title = `${profile.name}'s Digital House — A little life, counted in every second.`;
  }, [profile]);

  useEffect(() => writeJSON(KEYS.photos, photos), [photos]);
  useEffect(() => writeJSON(KEYS.custom, customMilestones), [customMilestones]);
  useEffect(() => writeJSON(KEYS.overrides, overrides), [overrides]);

  useEffect(() => {
    const timers = toastTimers.current;
    return () => {
      timers.forEach((id) => window.clearTimeout(id));
      timers.length = 0;
    };
  }, []);

  const notify = useCallback((text: string, tone: ToastMessage['tone'] = 'default') => {
    toastId.current += 1;
    const id = toastId.current;
    setToasts((current) => [...current, { id, text, tone }]);
    const timer = window.setTimeout(() => {
      setToasts((current) => current.filter((toast) => toast.id !== id));
    }, 4200);
    toastTimers.current.push(timer);
  }, []);

  const dismissToast = useCallback((id: number) => {
    setToasts((current) => current.filter((toast) => toast.id !== id));
  }, []);

  const confirmAction = useCallback((options: ConfirmOptions): Promise<boolean> => {
    resolverRef.current?.(false);
    confirmId.current += 1;
    return new Promise<boolean>((resolve) => {
      resolverRef.current = resolve;
      setConfirmState({ ...options, id: confirmId.current });
    });
  }, []);

  const settleConfirm = useCallback((ok: boolean) => {
    const resolve = resolverRef.current;
    resolverRef.current = null;
    setConfirmState(null);
    resolve?.(ok);
  }, []);

  const updateProfile = useCallback((patch: Partial<Profile>) => {
    setProfile((current) => ({ ...current, ...patch }));
  }, []);

  const openSettings = useCallback(() => {
    setKeepsakeOpen(false);
    setSettingsOpen(true);
  }, []);
  const closeSettings = useCallback(() => setSettingsOpen(false), []);
  const openKeepsake = useCallback(() => {
    setSettingsOpen(false);
    setKeepsakeOpen(true);
  }, []);
  const closeKeepsake = useCallback(() => setKeepsakeOpen(false), []);

  const addPhotos = useCallback(
    async (files: File[], category: string, date: string) => {
      const failed: string[] = [];
      const added: PhotoMeta[] = [];
      for (const file of files) {
        try {
          const processed = await preparePhotograph(file);
          const id = newId();
          await savePhotoBlob(id, processed.blob);
          forgetPhotoObjectUrl(id);
          added.push({
            id,
            caption: '',
            date,
            category,
            note: '',
            width: processed.width,
            height: processed.height,
            createdAt: Date.now(),
          });
        } catch (error) {
          failed.push(error instanceof Error ? `${file.name}: ${error.message}` : file.name);
        }
      }
      if (added.length) setPhotos((current) => [...added, ...current]);
      return { added: added.length, failed };
    },
    [],
  );

  const updatePhoto = useCallback((id: string, patch: Partial<PhotoMeta>) => {
    setPhotos((current) =>
      current.map((photo) => (photo.id === id ? { ...photo, ...patch } : photo)),
    );
  }, []);

  const deletePhoto = useCallback(async (id: string) => {
    setPhotos((current) => current.filter((photo) => photo.id !== id));
    try {
      await removePhotoBlob(id);
    } catch (error) {
      console.warn('Could not remove photograph data', error);
    }
    forgetPhotoObjectUrl(id);
  }, []);

  const setPortrait = useCallback(
    async (file: File | null) => {
      const previous = profile.portraitPhotoId;
      if (!file) {
        setProfile((current) => ({ ...current, portraitPhotoId: null }));
        if (previous) {
          try {
            await removePhotoBlob(previous);
          } catch (error) {
            console.warn('Could not remove the old portrait', error);
          }
          forgetPhotoObjectUrl(previous);
        }
        return;
      }
      const processed = await preparePhotograph(file);
      const id = newId();
      await savePhotoBlob(id, processed.blob);
      setProfile((current) => ({ ...current, portraitPhotoId: id }));
      if (previous) {
        try {
          await removePhotoBlob(previous);
        } catch (error) {
          console.warn('Could not remove the old portrait', error);
        }
        forgetPhotoObjectUrl(previous);
      }
    },
    [profile.portraitPhotoId],
  );

  const saveMilestonePhoto = useCallback(async (file: File) => {
    const processed = await preparePhotograph(file);
    const id = newId();
    await savePhotoBlob(id, processed.blob);
    return id;
  }, []);

  const discardPhoto = useCallback(async (id: string) => {
    try {
      await removePhotoBlob(id);
    } catch (error) {
      console.warn('Could not remove photograph data', error);
    }
    forgetPhotoObjectUrl(id);
  }, []);

  const addMilestone = useCallback((input: Omit<Milestone, 'id' | 'auto'>) => {
    setCustomMilestones((current) => [
      ...current,
      { ...input, id: `custom:${newId()}`, auto: false },
    ]);
  }, []);

  const updateMilestone = useCallback((id: string, patch: Partial<Milestone>) => {
    if (id.startsWith('auto:')) {
      setOverrides((current) => ({
        ...current,
        [id]: {
          ...current[id],
          ...(patch.title !== undefined ? { title: patch.title } : {}),
          ...(patch.description !== undefined ? { description: patch.description } : {}),
          ...(patch.date !== undefined ? { date: patch.date } : {}),
          ...(patch.special !== undefined ? { special: patch.special } : {}),
          ...(patch.photoId !== undefined ? { photoId: patch.photoId } : {}),
        },
      }));
      return;
    }
    setCustomMilestones((current) =>
      current.map((item) => (item.id === id ? { ...item, ...patch } : item)),
    );
  }, []);

  const deleteMilestone = useCallback(
    async (id: string) => {
      const custom = customMilestones.find((item) => item.id === id);
      if (custom) {
        const photoId = custom.photoId;
        setCustomMilestones((current) => current.filter((item) => item.id !== id));
        if (photoId) {
          try {
            await removePhotoBlob(photoId);
          } catch (error) {
            console.warn('Could not remove milestone photograph', error);
          }
          forgetPhotoObjectUrl(photoId);
        }
        return;
      }
      const override = overrides[id];
      setOverrides((current) => ({
        ...current,
        [id]: { ...current[id], hidden: true },
      }));
      if (override?.photoId) {
        try {
          await removePhotoBlob(override.photoId);
        } catch (error) {
          console.warn('Could not remove milestone photograph', error);
        }
        forgetPhotoObjectUrl(override.photoId);
      }
    },
    [customMilestones, overrides],
  );

  const resetEverything = useCallback(async () => {
    Object.values(KEYS).forEach((key) => {
      try {
        localStorage.removeItem(key);
      } catch {
        /* ignore */
      }
    });
    clearPhotoObjectUrls();
    try {
      await clearPhotoBlobs();
    } catch (error) {
      console.warn('Could not clear photograph storage', error);
    }
    setProfile(DEFAULT_PROFILE);
    setPhotos(seededPhotos());
    setCustomMilestones([]);
    setOverrides({});
    setSettingsOpen(false);
  }, []);

  const today = todayISO(profile.timeZone);
  const milestones = useMemo(
    () => buildMilestones(profile, customMilestones, overrides),
    [profile, customMilestones, overrides],
  );

  const value = useMemo<StoreValue>(
    () => ({
      profile,
      photos,
      customMilestones,
      overrides,
      milestones,
      today,
      settingsOpen,
      openSettings,
      closeSettings,
      keepsakeOpen,
      openKeepsake,
      closeKeepsake,
      updateProfile,
      addPhotos,
      updatePhoto,
      deletePhoto,
      setPortrait,
      saveMilestonePhoto,
      discardPhoto,
      addMilestone,
      updateMilestone,
      deleteMilestone,
      notify,
      toasts,
      dismissToast,
      confirmAction,
      confirmState,
      settleConfirm,
      resetEverything,
    }),
    [
      profile,
      photos,
      customMilestones,
      overrides,
      milestones,
      today,
      settingsOpen,
      openSettings,
      closeSettings,
      keepsakeOpen,
      openKeepsake,
      closeKeepsake,
      updateProfile,
      addPhotos,
      updatePhoto,
      deletePhoto,
      setPortrait,
      saveMilestonePhoto,
      discardPhoto,
      addMilestone,
      updateMilestone,
      deleteMilestone,
      notify,
      toasts,
      dismissToast,
      confirmAction,
      confirmState,
      settleConfirm,
      resetEverything,
    ],
  );

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore(): StoreValue {
  const context = useContext(StoreContext);
  if (!context) throw new Error('useStore must be used inside StoreProvider');
  return context;
}
