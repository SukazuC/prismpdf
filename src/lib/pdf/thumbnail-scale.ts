const TARGET_THUMBNAIL_WIDTH = 480;
const MIN_THUMBNAIL_SCALE = 0.45;
const MAX_THUMBNAIL_SCALE = 1.25;

export function getThumbnailScale(pageWidth: number) {
  const scale = TARGET_THUMBNAIL_WIDTH / pageWidth;
  return Math.min(MAX_THUMBNAIL_SCALE, Math.max(MIN_THUMBNAIL_SCALE, scale));
}
