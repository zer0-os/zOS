import { monthsSince, fromNow } from '../../../../lib/date';
import { User } from '../../../../store/channels';

export function lastSeenText(user): string {
  if (user.isOnline) {
    return 'Online';
  }

  if (user.lastSeenAt && monthsSince(user.lastSeenAt) >= 6) {
    return '';
  }

  return fromNow(user.lastSeenAt);
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
