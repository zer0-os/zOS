import { MAX_CACHE_AGE_MS } from './index';

export class BrowserMediaCache {
  private cacheName: string;
  private maxAgeMs: number; // Changed to milliseconds
  private cachePromise: Promise<Cache>;

  constructor(cacheName = 'image-store') {
    this.cacheName = cacheName;
    this.maxAgeMs = MAX_CACHE_AGE_MS;
    this.cachePromise = this.initCache();
  }

  private async initCache() {
    return await caches.open(this.cacheName);
  }

  private getCacheKey(url: string): Request {
    // Create a normalized cache key - critical for mxc:// URLs
    return new Request(`https://cache-key/${encodeURIComponent(url)}`);
  }

  async storeImage(url: string, blob: Blob): Promise<void> {
    try {
      const cache = await this.cachePromise;
      const cacheKey = this.getCacheKey(url);
      const response = new Response(blob, {
        headers: { date: new Date().toISOString() },
      });

      await cache.put(cacheKey, response);
    } catch (err) {
      console.error('Failed to store in browser cache:', err);
    }
  }

  async getImage(url: string): Promise<string | null> {
    try {
      const cache = await this.cachePromise;
      const cacheKey = this.getCacheKey(url);
      const response = await cache.match(cacheKey);

      if (!response) return null;

      // Create a new blob from the response
      // Refresh the timestamp on access (like IndexedDB does)
      const blob = await response.blob();
      const updatedResponse = new Response(blob, {
        headers: { date: new Date().toISOString() },
      });

      // Update the cache with fresh timestamp
      cache.put(cacheKey, updatedResponse);

      return URL.createObjectURL(blob);
    } catch (err) {
      console.error('Failed to get from browser cache:', err);
      return null;
    }
  }

  async clear() {
    try {
      console.log('xxx Clearing browser cache .. ');
      await caches.delete(this.cacheName);

      console.log('xxx Browser cache after clearing .. ', await caches.keys());
    } catch (err) {
      console.error('Failed to clear browser cache:', err);
    }
  }

  async cleanup() {
    try {
      const cache = await this.cachePromise;
      const keys = await cache.keys();
      const now = Date.now();
      let removedCount = 0;

      for (const request of keys) {
        const response = await cache.match(request);
        if (!response) continue;

        const dateHeader = response.headers.get('date');
        if (!dateHeader) continue;

        const timestamp = new Date(dateHeader).getTime();
        if (now - timestamp > this.maxAgeMs) {
          console.log(
            'xxx Removing from browser cache:',
            '\n  URL:',
            request.url,
            '\n  Last accessed:',
            new Date(timestamp).toISOString(),
            '\n  Current time:',
            new Date(now).toISOString(),
            '\n  Age (ms):',
            now - timestamp,
            '\n  Max age (ms):',
            this.maxAgeMs
          );
          await cache.delete(request);
          removedCount++;
        }
      }

      return removedCount;
    } catch (err) {
      console.error('Failed to cleanup browser cache:', err);
      return 0;
    }
  }
}

let browserCacheInstance: BrowserMediaCache | null = null;

export function getBrowserCache(): BrowserMediaCache {
  if (!browserCacheInstance) {
    browserCacheInstance = new BrowserMediaCache();
  }
  return browserCacheInstance;
}
