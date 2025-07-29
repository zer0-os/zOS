import { UnreadCount } from './useSidekick';

/**
 * Calculates the total unread count for the Channels tab
 * @param unreadCounts - Object mapping ZIDs to their unread counts
 * @param zids - Array of ZIDs to include in the calculation
 * @returns Total unread count (prioritizes highlights over total counts)
 */
export const calculateChannelsTabUnreadCount = (
  unreadCounts: { [zid: string]: UnreadCount },
  zids?: string[]
): number => {
  if (!zids || zids.length === 0) {
    return 0;
  }

  let totalUnread = 0;

  zids.forEach((zid) => {
    const unreadCount = unreadCounts[zid];
    if (unreadCount) {
      // Prioritize highlights over total counts
      if (unreadCount.highlight > 0) {
        totalUnread += unreadCount.highlight;
      } else if (unreadCount.total > 0) {
        totalUnread += unreadCount.total;
      }
    }
  });

  return totalUnread;
};
