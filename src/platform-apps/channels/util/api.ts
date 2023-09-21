import { chat } from '../../../lib/chat';
import { searchMentionableUsers } from '../../../store/channels/api';

export async function searchMentionableUsersForChannel(
  channelId: string,
  search: string,
  apiSearch = searchMentionableUsers
) {
  const results = await apiSearch(channelId, search);
  return results.map((u) => ({ id: u.id, display: u.name, profileImage: u.profileImage }));
}

export async function searchMyNetworksByName(search: string) {
  const chatClient = chat.get();
  return await chatClient.searchMyNetworksByName(search);
}
