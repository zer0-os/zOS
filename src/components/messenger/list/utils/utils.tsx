import { monthsSince, fromNow } from '../../../../lib/date';
import { User } from '../../../../store/channels';
import { Wallet } from '../../../../store/authentication/types';

export function lastSeenText(user): string {
  if (user.isOnline) {
    return 'Online';
  }

  if (monthsSince(user.lastSeenAt) >= 6) {
    return '';
  }

  return 'Last Seen: ' + (user.lastSeenAt ? fromNow(user.lastSeenAt) : 'Never');
}

export function isCustomIcon(url?: string) {
  if (!url) return false;

  // Sendbird sets a custom icon by default. 🤞 that it's a good enough filter for now.
  return !url.startsWith('https://static.sendbird.com/sample');
}

export function isUserAdmin(user: User, adminIds: string[]) {
  return adminIds.includes(user.matrixId);
}

export function sortMembers(members: User[], adminIds: string[]) {
  return members.sort((a, b) => {
    const aIsAdmin = isUserAdmin(a, adminIds);
    const bIsAdmin = isUserAdmin(b, adminIds);

    // Sort admins next
    if (aIsAdmin && !bIsAdmin) return -1;
    if (!aIsAdmin && bIsAdmin) return 1;

    // Then sort by online status
    if (a.isOnline && !b.isOnline) return -1;
    if (!a.isOnline && b.isOnline) return 1;

    // Finally sort alphabetically by firstName
    return a.firstName!.localeCompare(b.firstName);
  });
}

export function getUserHandle(primaryZID: string, wallets: Wallet[]) {
  if (primaryZID) {
    return primaryZID;
  }

  const publicAddress = wallets?.[0]?.publicAddress;

  if (publicAddress) {
    return `${publicAddress.substring(0, 6)}...${publicAddress.substring(publicAddress.length - 4)}`;
  }

  return '';
}
