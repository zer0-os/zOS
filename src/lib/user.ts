import { User } from '../store/channels';
import { isOlderThanMonths } from './date';
import { featureFlags } from './feature-flags';

export function displayName(user: User) {
  if (!user) {
    return 'Unknown';
  }

  const name = `${user.firstName ?? ''} ${user.lastName ?? ''}`.trim();
  return name || 'Unknown';
}

export function getUserSubHandle(primaryZID: string, primaryWalletAddress: string) {
  if (primaryZID) {
    return primaryZID;
  }

  if (primaryWalletAddress) {
    return `${primaryWalletAddress.substring(0, 6)}...${primaryWalletAddress.substring(
      primaryWalletAddress.length - 4
    )}`;
  }

  return '';
}

export type PresenceStatusType = 'active' | 'offline' | undefined;

export function getPresenceStatusType(user: User): PresenceStatusType {
  if (!featureFlags.enablePresence) return undefined;

  const { isOnline, lastSeenAt } = user || ({} as any);
  if (typeof isOnline !== 'boolean') return undefined;
  try {
    if (isOlderThanMonths(lastSeenAt, 2)) return undefined;
  } catch {}
  return isOnline ? 'active' : 'offline';
}
