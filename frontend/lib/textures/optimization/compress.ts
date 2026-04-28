/**
 * Browser-side "compression" via resolution reduction + optional lossy re-encode.
 */

export type TranscodeFormat = 'image/webp' | 'image/jpeg' | 'image/png';

export type TranscodeResult = {
  blob: Blob;
  objectUrl: string;
  format: TranscodeFormat;
};

/**
 * Draw `source` into a canvas scaled so the longest edge ≤ `maxDimension`, then encode.
 * Caller should `URL.revokeObjectURL` when done, or use `transcodeCanvasToBlob` + manual cleanup.
 */
export async function transcodeImageElement(
  source: CanvasImageSource,
  naturalWidth: number,
  naturalHeight: number,
  maxDimension: number,
  format: TranscodeFormat,
  quality: number
): Promise<TranscodeResult> {
  const scale = Math.min(1, maxDimension / Math.max(naturalWidth, naturalHeight, 1));
  const w = Math.max(1, Math.floor(naturalWidth * scale));
  const h = Math.max(1, Math.floor(naturalHeight * scale));

  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('2D context unavailable');
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';
  ctx.drawImage(source, 0, 0, w, h);

  const blob = await new Promise<Blob>((resolve, reject) => {
    const q = format === 'image/png' ? undefined : quality;
    canvas.toBlob(
      (b) => (b ? resolve(b) : reject(new Error('toBlob failed'))),
      format,
      q as number | undefined
    );
  });

  const objectUrl = URL.createObjectURL(blob);
  return { blob, objectUrl, format };
}

export function pickTranscodeFormat(preferWebp: boolean): TranscodeFormat {
  if (preferWebp && typeof document !== 'undefined') {
    const c = document.createElement('canvas');
    if (c.toDataURL('image/webp').startsWith('data:image/webp')) return 'image/webp';
  }
  return 'image/jpeg';
}
