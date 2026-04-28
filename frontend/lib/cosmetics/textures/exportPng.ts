/**
 * PNG export helpers for cosmetic textures (browser).
 */

export function cosmeticTextureToDataURL(canvas: HTMLCanvasElement, mime: 'image/png' = 'image/png'): string {
  return canvas.toDataURL(mime);
}

export function cosmeticTextureToBlob(canvas: HTMLCanvasElement): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) resolve(blob);
        else reject(new Error('cosmeticTextureToBlob: toBlob returned null'));
      },
      'image/png',
      1
    );
  });
}

export function downloadCosmeticTexturePng(canvas: HTMLCanvasElement, filename: string): void {
  const url = cosmeticTextureToDataURL(canvas);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename.endsWith('.png') ? filename : `${filename}.png`;
  a.click();
}
