import { monthsSince, fromNow } from '../../../../lib/date';
import { User } from '../../../../store/channels';

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

export function isUserAdmin(user: Partial<User>, adminIds: string[]) {
  return adminIds.includes(user.matrixId!);
}

export function sortMembers(members: Partial<User>[], adminIds?: string[], currentUserId?: string) {
  return members.sort((a, b) => {
    const aIsAdmin = adminIds ? isUserAdmin(a, adminIds) : false;
    const bIsAdmin = adminIds ? isUserAdmin(b, adminIds) : false;

    // Sort current user to the top
    if (a.userId === currentUserId) return -1;
    if (b.userId === currentUserId) return 1;

    // Sort admins next
    if (aIsAdmin && !bIsAdmin) return -1;
    if (!aIsAdmin && bIsAdmin) return 1;

    // Then sort by online status
    if (a.isOnline && !b.isOnline) return -1;
    if (!a.isOnline && b.isOnline) return 1;

    // Finally sort alphabetically by firstName
    return a.firstName!.localeCompare(b.firstName!);
  });
}
