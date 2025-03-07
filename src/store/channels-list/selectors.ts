import getDeepProperty from 'lodash.get';
import { denormalize } from '../channels';
import { compareDatesDesc } from '../../lib/date';
import { AsyncListStatus } from '../normalized';

export function channelListStatus(state) {
  return getDeepProperty(state, 'channelsList.status', AsyncListStatus.Idle);
}

export function rawConversationsList(state) {
  return getDeepProperty(state, 'channelsList.value', []);
}

export function mostRecentConversation(state) {
  const roomIds = getDeepProperty(state, 'channelsList.value', []);
  if (!roomIds.length) {
    return null;
  }

  const rooms = denormalize(roomIds, state);
  const roomsWithMetaData = rooms.map(addLastMessage);
  return roomsWithMetaData.sort(byLastMessageOrCreation)[0];
}

function addLastMessage(conversation) {
  const sortedMessages = conversation.messages?.sort((a, b) => compareDatesDesc(a.createdAt, b.createdAt)) || [];
  return { ...conversation, lastMessage: sortedMessages[0] };
}

function byLastMessageOrCreation(a, b) {
  const aDate = a.lastMessage?.createdAt || a.createdAt;
  const bDate = b.lastMessage?.createdAt || b.createdAt;
  return compareDatesDesc(aDate, bDate);
}
