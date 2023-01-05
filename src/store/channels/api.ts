import { get, post, put } from '../../lib/api/rest';

export async function fetchUsersByChannelId(channelId: string): Promise<any> {
  return await get<any>(`/chatChannels/${channelId}/members`)
    .catch((_error) => {
      return null;
    })
    .then((response) => {
      return response.body;
    });
}

export async function joinChannel(channelId: string): Promise<number> {
  const response = await post<any>(`/chatChannels/${channelId}/join`);

  return response.status;
}

export async function markAllMessagesAsReadInChannel(channelId: string, userId: string): Promise<number> {
  const response = await put<any>(`/chatChannels/${channelId}/messages/mark-as-read`).send({ id: userId });

  return response.status;
}
