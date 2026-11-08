import type { PhotoMeta } from '../lib/types';
import { StoredImage } from './StoredImage';

interface PhotoViewProps {
  photo: PhotoMeta;
  className?: string;
  loading?: 'eager' | 'lazy';
}

export function PhotoView({ photo, className, loading = 'lazy' }: PhotoViewProps) {
  if (photo.src) {
    return (
      <img
        src={photo.src}
        alt={photo.caption || 'A botanical illustration'}
        className={className}
        loading={loading}
        decoding="async"
        width={photo.width}
        height={photo.height}
      />
    );
  }
  return (
    <StoredImage
      photoId={photo.id}
      alt={photo.caption || `A photograph of ${'Aphrodite'}`}
      className={className}
      loading={loading}
      width={photo.width}
      height={photo.height}
    />
  );
}
