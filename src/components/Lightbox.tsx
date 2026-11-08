import { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import type { PhotoMeta } from '../lib/types';
import { formatDateShort } from '../lib/time';
import { ChevronLeftIcon, ChevronRightIcon, CloseIcon } from './Icons';
import { PhotoView } from './PhotoView';

interface LightboxProps {
  photos: PhotoMeta[];
  index: number;
  onClose: () => void;
  onNavigate: (index: number) => void;
}

export function Lightbox({ photos, index, onClose, onNavigate }: LightboxProps) {
  const closeRef = useRef<HTMLButtonElement>(null);
  const photo = photos[index];

  useEffect(() => {
    const previous = document.activeElement as HTMLElement | null;
    document.body.classList.add('modal-open');
    closeRef.current?.focus();
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
      if (event.key === 'ArrowRight') onNavigate((index + 1) % photos.length);
      if (event.key === 'ArrowLeft') onNavigate((index - 1 + photos.length) % photos.length);
    };
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.body.classList.remove('modal-open');
      previous?.focus?.();
    };
  }, [index, photos.length, onClose, onNavigate]);

  if (!photo) return null;

  return createPortal(
    <div className="lightbox" role="dialog" aria-modal="true" aria-label={`Photograph ${index + 1} of ${photos.length}`}>
      <button
        type="button"
        className="lightbox__close"
        onClick={onClose}
        aria-label="Close photograph"
        ref={closeRef}
      >
        <CloseIcon />
      </button>

      {photos.length > 1 ? (
        <button
          type="button"
          className="lightbox__arrow lightbox__arrow--prev"
          onClick={() => onNavigate((index - 1 + photos.length) % photos.length)}
          aria-label="Previous photograph"
        >
          <ChevronLeftIcon />
        </button>
      ) : null}

      <figure className="lightbox__figure">
        <div className="lightbox__image-wrap">
          <PhotoView photo={photo} className="lightbox__image" loading="eager" />
        </div>
        <figcaption className="lightbox__caption">
          <p className="eyebrow">{photo.category}</p>
          <h3>{photo.caption || 'An untitled moment'}</h3>
          <p className="lightbox__date">{formatDateShort(photo.date)}</p>
          {photo.note ? <p className="lightbox__note">{photo.note}</p> : null}
        </figcaption>
      </figure>

      {photos.length > 1 ? (
        <button
          type="button"
          className="lightbox__arrow lightbox__arrow--next"
          onClick={() => onNavigate((index + 1) % photos.length)}
          aria-label="Next photograph"
        >
          <ChevronRightIcon />
        </button>
      ) : null}

      <p className="lightbox__count">
        {String(index + 1).padStart(2, '0')} <span>/</span> {String(photos.length).padStart(2, '0')}
      </p>
    </div>,
    document.body,
  );
}
