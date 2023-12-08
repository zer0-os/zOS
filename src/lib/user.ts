import { User } from '../store/channels';

export function displayName(user: User) {
  if (!user) {
    return 'Unknown';
  }

  const name = `${user.firstName ?? ''} ${user.lastName ?? ''}`.trim();
  return name || 'Unknown';
}
