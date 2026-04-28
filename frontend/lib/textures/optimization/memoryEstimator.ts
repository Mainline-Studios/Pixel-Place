/** Approximate GPU bytes for a 2D texture incl. mip chain (~4/3 factor). */
export function estimateTexture2DBytes(
  width: number,
  height: number,
  bytesPerPixel: number = 4,
  withMipmaps = true
): number {
  const base = width * height * bytesPerPixel;
  return withMipmaps ? Math.ceil(base * (4 / 3)) : base;
}

export function estimateThreeTextureBytes(tex: {
  image?: { width?: number; height?: number } | null;
}): number {
  const img = tex.image as { width?: number; height?: number } | undefined;
  const w = img?.width ?? 0;
  const h = img?.height ?? 0;
  if (w <= 0 || h <= 0) return 0;
  return estimateTexture2DBytes(w, h, 4, true);
}
