import { getProvider } from './media-cache/idb';

export async function clearIndexedDBStorage(): Promise<void> {
  const provider = await getProvider();
  await provider.clear();
}
