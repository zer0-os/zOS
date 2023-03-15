import { get } from '../../lib/api/rest';

export async function fetchNotifications(userId: string) {
  const response = await get<any>('/api/notifications/filter', { limit: 15 }, { userId });
  return response.body;
}
