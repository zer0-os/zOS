import { get } from '../../lib/api/rest';

export async function fetchNotifications(userId: string) {
  const response = await get<any>('/api/notifications/filter', { limit: 15 }, { userId });
  return response.body;
}

export async function fetchNotification(notificationId: string) {
  const response = await get<any>(`/api/notifications/${notificationId}/enhanced`);
  return response.body;
}
