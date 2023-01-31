import { searchMentionableUsers } from '../../../store/channels/api';
import { User } from '../../../store/channels';

export async function searchMentionableUsersForChannel(
  channelId: string,
  search: string,
  // When the api is updated to only return channel users we can remove this argument
  validUsers: Array<User>,
  apiSearch = searchMentionableUsers
) {
  const results = await apiSearch(channelId, search);
  return results
    .filter((user) => validUsers.find((valid) => user.id === valid.id))
    .map((u) => ({ id: u.id, display: u.name }));
}
