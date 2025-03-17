import { getProvider } from './idb';
import { getBrowserCache } from './browser-cache';

export const MAX_CACHE_AGE_MS = 2 * 24 * 60 * 60 * 1000; // 2 days

// FileUrl is the mxc://.. url of the file
export async function getFileFromCache(fileUrl: string): Promise<string | null> {
  // Try browser cache first (faster, memory efficient)
  const browserCache = getBrowserCache();
  const cachedUrl = await browserCache.getImage(fileUrl);
  if (cachedUrl) {
    return cachedUrl;
  }

  // Try IndexedDB if not in browser cache
  const indexedDB = getProvider();
  const blob = await indexedDB.get(fileUrl);
  if (blob) {
    // Store in browser cache for future requests
    browserCache.storeImage(fileUrl, blob);
    return URL.createObjectURL(blob);
  }

  return null;
}

// Store file in all caches
export async function putFileToCache(fileUrl: string, blob: Blob): Promise<void> {
  const indexedDB = getProvider();
  const browserCache = getBrowserCache();

  // Store in IndexedDB for persistence & browser cache for memory efficiency
  await Promise.all([indexedDB.put(fileUrl, blob), browserCache.storeImage(fileUrl, blob)]);
}

export async function performCacheMaintenance(): Promise<void> {
  const [idbRemoved, browserRemoved] = await Promise.all([getProvider().cleanupExpired(), getBrowserCache().cleanup()]);

  console.log(
    `Cache maintenance completed: removed ${idbRemoved} items from IndexedDB and ${browserRemoved} from browser cache`
  );
}

export async function clearCache(): Promise<void> {
  await getProvider().clear();
  await getBrowserCache().clear();
}
