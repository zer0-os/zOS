import { searchMentionableUsers } from '../../../store/channels/api';
import { searchMyNetworksByName as searchMyNetworksByNameApi } from '../../../store/users/api';

export async function searchMentionableUsersForChannel(
  channelId: string,
  search: string,
  apiSearch = searchMentionableUsers
) {
  const results = await apiSearch(channelId, search);
  return results.map((u) => ({ id: u.id, display: u.name, profileImage: u.profileImage }));
}

export async function searchMyNetworksByName(search: string, apiSearch = searchMyNetworksByNameApi) {
  return await apiSearch(search);
}
