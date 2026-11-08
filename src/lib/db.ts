/** IndexedDB storage for photograph blobs, with an in-session object-URL cache. */

const DB_NAME = 'aphrodite-digital-house';
const STORE = 'photographs';
const VERSION = 1;

let dbPromise: Promise<IDBDatabase> | null = null;

function openDatabase(): Promise<IDBDatabase> {
  if (dbPromise) return dbPromise;
  dbPromise = new Promise((resolve, reject) => {
    if (typeof indexedDB === 'undefined') {
      reject(new Error('This browser does not support IndexedDB, so photographs cannot be stored.'));
      return;
    }
    const request = indexedDB.open(DB_NAME, VERSION);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE)) db.createObjectStore(STORE, { keyPath: 'id' });
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error ?? new Error('Could not open photograph storage.'));
    request.onblocked = () => reject(new Error('Photograph storage is blocked by another tab.'));
  });
  return dbPromise;
}

function transaction<T>(mode: IDBTransactionMode, run: (store: IDBObjectStore) => IDBRequest<T>): Promise<T> {
  return openDatabase().then(
    (db) =>
      new Promise<T>((resolve, reject) => {
        const tx = db.transaction(STORE, mode);
        const request = run(tx.objectStore(STORE));
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error ?? new Error('Photograph storage failed.'));
        tx.onerror = () => reject(tx.error ?? new Error('Photograph storage failed.'));
      }),
  );
}

export async function savePhotoBlob(id: string, blob: Blob): Promise<void> {
  await transaction('readwrite', (store) => store.put({ id, blob }));
}

export async function readPhotoBlob(id: string): Promise<Blob | null> {
  const record = await transaction<{ id: string; blob: Blob } | undefined>('readonly', (store) => store.get(id));
  return record?.blob ?? null;
}

export async function removePhotoBlob(id: string): Promise<void> {
  await transaction('readwrite', (store) => store.delete(id));
}

export async function clearPhotoBlobs(): Promise<void> {
  await transaction('readwrite', (store) => store.clear());
}

const urlCache = new Map<string, string>();
const pending = new Map<string, Promise<string | null>>();

/** Resolve (and cache) an object URL for a stored photograph. */
export function photoObjectUrl(id: string): Promise<string | null> {
  const cached = urlCache.get(id);
  if (cached) return Promise.resolve(cached);
  const inFlight = pending.get(id);
  if (inFlight) return inFlight;

  const task = readPhotoBlob(id)
    .then((blob) => {
      if (!blob) return null;
      const url = URL.createObjectURL(blob);
      urlCache.set(id, url);
      return url;
    })
    .catch(() => null)
    .finally(() => pending.delete(id));

  pending.set(id, task);
  return task;
}

export function forgetPhotoObjectUrl(id: string): void {
  const url = urlCache.get(id);
  if (url) {
    URL.revokeObjectURL(url);
    urlCache.delete(id);
  }
}

export function clearPhotoObjectUrls(): void {
  urlCache.forEach((url) => URL.revokeObjectURL(url));
  urlCache.clear();
}
