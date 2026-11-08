import { useEffect, useState } from 'react';
import { photoObjectUrl } from '../lib/db';

interface StoredImageProps {
  photoId: string | null;
  alt: string;
  className?: string;
  loading?: 'eager' | 'lazy';
  width?: number;
  height?: number;
}

/** Loads a photograph blob from IndexedDB and renders it via a cached object URL. */
export function StoredImage({ photoId, alt, className, loading = 'lazy', width, height }: StoredImageProps) {
  const [url, setUrl] = useState<string | null>(null);
  const [state, setState] = useState<'idle' | 'loading' | 'missing' | 'error'>('idle');

  useEffect(() => {
    let active = true;
    if (!photoId) {
      setUrl(null);
      setState('missing');
      return () => {
        active = false;
      };
    }
    setState('loading');
    photoObjectUrl(photoId).then((resolved) => {
      if (!active) return;
      if (resolved) {
        setUrl(resolved);
        setState('idle');
      } else {
        setState('missing');
      }
    }).catch(() => {
      if (active) setState('error');
    });
    return () => {
      active = false;
    };
  }, [photoId]);

  if (!url) {
    return (
      <div className={[className, 'stored-image__fallback'].filter(Boolean).join(' ')} aria-hidden="true">
        <span>{state === 'error' ? 'Photograph unavailable' : 'Loading photograph'}</span>
      </div>
    );
  }

  return (
    <img
      src={url}
      alt={alt}
      className={className}
      loading={loading}
      decoding="async"
      width={width}
      height={height}
    />
  );
}
