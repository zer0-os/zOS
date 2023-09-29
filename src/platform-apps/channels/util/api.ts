import { chat } from '../../../lib/chat';
import { User as ChannelMember } from '../../../store/channels';

export async function searchMentionableUsersForChannel(
  channelId: string,
  search: string,
  channelMembers: ChannelMember[]
) {
  const chatClient = chat.get();
  return await chatClient.searchMentionableUsersForChannel(channelId, search, channelMembers);
}

export async function searchMyNetworksByName(search: string) {
  const chatClient = chat.get();
  return await chatClient.searchMyNetworksByName(search);
}
