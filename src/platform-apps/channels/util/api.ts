import { chat } from '../../../lib/chat';

export async function searchMentionableUsersForChannel(channelId: string, search: string) {
  const chatClient = chat.get();
  return await chatClient.searchMentionableUsersForChannel(channelId, search);
}

export async function searchMyNetworksByName(search: string) {
  const chatClient = chat.get();
  return await chatClient.searchMyNetworksByName(search);
}
