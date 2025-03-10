import { getProvider } from './idb';

export async function clearIndexedDBStorage(): Promise<void> {
  const provider = await getProvider();
  await provider.clear();
}
