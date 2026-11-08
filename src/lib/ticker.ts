import { useSyncExternalStore } from 'react';

/**
 * One shared, drift-free clock for the whole page.
 *
 * A single timeout is aligned to the next wall-clock second and every value is
 * read from Date.now() rather than accumulated, so the display cannot creep.
 * The timer only runs while something is listening and the tab is visible; when
 * the tab wakes up the current time is published immediately.
 */

let current = Date.now();
let timer: number | null = null;
let subscribers = 0;
const listeners = new Set<() => void>();

function publish() {
  current = Date.now();
  listeners.forEach((listener) => listener());
}

function clearTimer() {
  if (timer !== null) {
    window.clearTimeout(timer);
    timer = null;
  }
}

function schedule() {
  if (timer !== null || subscribers === 0) return;
  if (typeof document !== 'undefined' && document.visibilityState === 'hidden') return;
  const delay = 1000 - (Date.now() % 1000) + 8;
  timer = window.setTimeout(() => {
    timer = null;
    publish();
    schedule();
  }, delay);
}

function handleVisibility() {
  clearTimer();
  if (document.visibilityState === 'visible') {
    publish();
    schedule();
  }
}

if (typeof document !== 'undefined') {
  document.addEventListener('visibilitychange', handleVisibility);
}

function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  subscribers += 1;
  schedule();
  return () => {
    listeners.delete(listener);
    subscribers = Math.max(0, subscribers - 1);
    if (subscribers === 0) clearTimer();
  };
}

function getSnapshot(): number {
  return current;
}

/** Re-renders the calling component once per second. Keep these components small. */
export function useNow(): number {
  return useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
}
