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

export const highlightFilter = (text, filter) => {
  const regex = new RegExp(`(${filter})`, 'i');

  if (filter !== '') {
    return text.split(regex).map((part, index) =>
      part.toLowerCase() === filter.toLowerCase() ? (
        <span key={index} className='highlighted'>
          {part}
        </span>
      ) : (
        part
      )
    );
  }

  return text;
};
