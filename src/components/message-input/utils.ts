import { User } from '../../store/channels';

export interface UserForMention {
  display: string;
  id: User['id'];
}

export const getUsersForMentions = (search: string, users: User[]): UserForMention[] => {
  if (users && users.length) {
    return users
      .map((user) => ({
        display: [
          user.firstName,
          user.lastName,
        ].join(' '),
        id: user.id,
      }))
      .filter((user) => user.display.toLowerCase().includes(search.toLowerCase()));
  }
  return [];
};
