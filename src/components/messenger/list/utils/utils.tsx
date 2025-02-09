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
  return adminIds?.includes(user.matrixId);
}

export function isUserModerator(user: User, moderatorIds: string[]) {
  return moderatorIds?.includes(user.userId);
}

export function sortMembers(members: User[], adminIds: string[], conversationModeratorIds: string[]) {
  return members.sort((a, b) => {
    const aIsAdmin = isUserAdmin(a, adminIds);
    const bIsAdmin = isUserAdmin(b, adminIds);

    // Sort admins next
    if (aIsAdmin && !bIsAdmin) return -1;
    if (!aIsAdmin && bIsAdmin) return 1;

    // Sort moderators next
    const aIsModerator = isUserModerator(a, conversationModeratorIds);
    const bIsModerator = isUserModerator(b, conversationModeratorIds);

    if (aIsModerator && !bIsModerator) return -1;
    if (!aIsModerator && bIsModerator) return 1;

    // Then sort by online status
    if (a.isOnline && !b.isOnline) return -1;
    if (!a.isOnline && b.isOnline) return 1;

    // Finally sort alphabetically by firstName
    return (a.firstName || '').localeCompare(b.firstName || '');
  });
}

export function getTagForUser(user: User, conversationAdminIds: string[], conversationModeratorIds: string[] = []) {
  let tag = null;
  if (isUserAdmin(user, conversationAdminIds)) {
    tag = 'Admin';
  }
  if (isUserModerator(user, conversationModeratorIds)) {
    tag = 'Mod';
  }

  return tag;
}
