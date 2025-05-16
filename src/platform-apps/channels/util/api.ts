import { chat } from '../../../lib/chat';
import { User as ChannelMember } from '../../../store/channels';

export function searchMentionableUsersForChannel(search: string, channelMembers: ChannelMember[]) {
  const chatClient = chat.get();
  return chatClient.searchMentionableUsersForChannel(search, channelMembers);
}

export async function searchMyNetworksByName(search: string) {
  const chatClient = chat.get();
  return await chatClient.searchMyNetworksByName(search);
}
