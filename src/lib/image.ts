/** Client-side photo optimisation so the house stays fast and storage stays small. */

export interface ProcessedImage {
  blob: Blob;
  width: number;
  height: number;
}

const MAX_EDGE = 2000;

async function decode(file: File): Promise<{ source: CanvasImageSource; width: number; height: number }> {
  if (typeof createImageBitmap === 'function') {
    try {
      const bitmap = await createImageBitmap(file);
      return { source: bitmap, width: bitmap.width, height: bitmap.height };
    } catch {
      /* fall back to an <img>, which handles formats createImageBitmap may refuse */
    }
  }
  const url = URL.createObjectURL(file);
  try {
    const image = await new Promise<HTMLImageElement>((resolve, reject) => {
      const element = new Image();
      element.onload = () => resolve(element);
      element.onerror = () => reject(new Error('That image could not be read.'));
      element.src = url;
    });
    return { source: image, width: image.naturalWidth, height: image.naturalHeight };
  } finally {
    URL.revokeObjectURL(url);
  }
}

function toBlob(canvas: HTMLCanvasElement, type: string, quality: number): Promise<Blob | null> {
  return new Promise((resolve) => canvas.toBlob((blob) => resolve(blob), type, quality));
}

function releaseSource(source: CanvasImageSource): void {
  if (typeof ImageBitmap !== 'undefined' && source instanceof ImageBitmap) source.close();
}

/**
 * Downscale to a sensible maximum edge and re-encode. Falls back to the
 * original file if the browser cannot encode the image.
 */
export async function preparePhotograph(file: File): Promise<ProcessedImage> {
  if (!file.type.startsWith('image/')) {
    throw new Error(`"${file.name}" is not an image file.`);
  }

  const fallback = async (): Promise<ProcessedImage> => {
    const bitmap = await decode(file);
    const result = { blob: file, width: bitmap.width, height: bitmap.height };
    releaseSource(bitmap.source);
    return result;
  };

  try {
    const { source, width, height } = await decode(file);
    if (!width || !height) throw new Error('That image has no dimensions.');

    const scale = Math.min(1, MAX_EDGE / Math.max(width, height));
    const targetWidth = Math.max(1, Math.round(width * scale));
    const targetHeight = Math.max(1, Math.round(height * scale));

    const canvas = document.createElement('canvas');
    canvas.width = targetWidth;
    canvas.height = targetHeight;
    const context = canvas.getContext('2d');
    if (!context) throw new Error('Canvas is unavailable in this browser.');
    context.imageSmoothingQuality = 'high';
    context.drawImage(source, 0, 0, targetWidth, targetHeight);
    releaseSource(source);

    const blob = (await toBlob(canvas, 'image/webp', 0.9)) ?? (await toBlob(canvas, 'image/jpeg', 0.9));
    if (!blob) throw new Error('This image could not be optimised.');
    return { blob, width: targetWidth, height: targetHeight };
  } catch (error) {
    if (error instanceof Error && error.message.includes('not an image')) throw error;
    return fallback();
  }
}

/** Read intrinsic dimensions quickly for an object URL. */
export function measureImage(url: string): Promise<{ width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve({ width: image.naturalWidth, height: image.naturalHeight });
    image.onerror = () => reject(new Error('Image could not be measured.'));
    image.src = url;
  });
}
