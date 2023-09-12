import { monthsSince, fromNow } from '../../../../lib/date';

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
