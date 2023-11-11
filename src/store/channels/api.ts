import { post } from '../../lib/api/rest';

export async function joinChannel(channelId: string): Promise<number> {
  const response = await post<any>(`/chatChannels/${channelId}/join`);

  return response.status;
}

export type MentionableUser = {
  id: string;
  name: string;
  profileImage: string;
};
