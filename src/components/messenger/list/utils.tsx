import { monthsSince, fromNow } from '../../../lib/date';

export function lastSeenText(user): string {
  if (user.isOnline) {
    return 'Online';
  }

  if (monthsSince(user.lastSeenAt) >= 6) {
    return '';
  }

  return 'Last Seen: ' + (user.lastSeenAt ? fromNow(user.lastSeenAt) : 'Never');
}

export function escapeRegExp(string) {
  if (typeof string !== 'string') {
    return;
  }

  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); // $& means the whole matched string
}
