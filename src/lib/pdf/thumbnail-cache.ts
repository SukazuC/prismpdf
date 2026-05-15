const cache = new Map<string, string>();

export function getCachedThumbnail(key: string): string | undefined {
  return cache.get(key);
}

export function setCachedThumbnail(key: string, url: string) {
  const existing = cache.get(key);
  if (existing) URL.revokeObjectURL(existing);
  cache.set(key, url);
}

export function clearThumbnailCache() {
  for (const url of cache.values()) {
    URL.revokeObjectURL(url);
  }
  cache.clear();
}

export function evictThumbnail(key: string) {
  const url = cache.get(key);
  if (url) URL.revokeObjectURL(url);
  cache.delete(key);
}
