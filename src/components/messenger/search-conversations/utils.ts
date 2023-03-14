import { User } from '../../../store/channels';

export function mapMembersToString(otherMembers: User[]) {
  return otherMembers
    .map((member) =>
      [
        member.firstName,
        member.lastName,
      ]
        .filter((e) => e)
        .join(' ')
    )
    .join(', ')
    .trim();
}
