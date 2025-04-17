import { otherMembersToString } from '../../../../platform-apps/channels/util';
import { isOneOnOne } from '../../../../store/channels-list/utils';

function matchesConversationName(conversation, searchRegEx) {
  return searchRegEx.test(conversation.name ?? '');
}

function matchesMembersName(conversation, searchRegEx) {
  const membersNames = otherMembersToString(conversation.otherMembers);
  return searchRegEx.test(membersNames);
}

function matchesMembersPrimaryZID(conversation, searchRegEx) {
  return conversation.otherMembers.some((member) => searchRegEx.test(member.primaryZID));
}

function isOneOnOneConversationMatch(conversation, searchRegEx) {
  return (
    isOneOnOne(conversation) &&
    (matchesMembersName(conversation, searchRegEx) || matchesMembersPrimaryZID(conversation, searchRegEx))
  );
}

export function getDirectMatches(conversations, searchRegEx) {
  return conversations.filter(
    (conversation) =>
      matchesConversationName(conversation, searchRegEx) || isOneOnOneConversationMatch(conversation, searchRegEx)
  );
}

export function getIndirectMatches(conversations, searchRegEx) {
  const directMatches = getDirectMatches(conversations, searchRegEx);

  return conversations.filter(
    (conversation) =>
      !directMatches.includes(conversation) &&
      (matchesMembersName(conversation, searchRegEx) || matchesMembersPrimaryZID(conversation, searchRegEx))
  );
}
