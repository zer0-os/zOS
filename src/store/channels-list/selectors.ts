import getDeepProperty from 'lodash.get';
import { denormalize } from '../channels';
import { compareDatesDesc } from '../../lib/date';
import { AsyncListStatus } from '../normalized';
import { channelSelector } from '../channels/selectors';
import { createSelector } from '@reduxjs/toolkit';
import { isOneOnOne } from './utils';
import { Channel } from '../channels';

export function channelListStatus(state) {
  return getDeepProperty(state, 'channelsList.status', AsyncListStatus.Idle);
}

export function rawConversationsList(state) {
  return getDeepProperty(state, 'channelsList.value', []);
}

export function conversationsListSelector(state): Channel[] {
  return denormalize(rawConversationsList(state), state);
}

export const mostRecentConversation = createSelector([conversationsListSelector, (state) => state], (rooms) => {
  if (!rooms.length) {
    return null;
  }

  const roomsWithMetaData = rooms.map(addLastMessage);
  return roomsWithMetaData.sort(byLastMessageOrCreation)[0];
});

function addLastMessage(conversation) {
  const sortedMessages = conversation.messages?.sort((a, b) => compareDatesDesc(a.createdAt, b.createdAt)) || [];
  return { ...conversation, lastMessage: sortedMessages[0] };
}

function byLastMessageOrCreation(a, b) {
  const aDate = a.lastMessage?.createdAt || a.createdAt;
  const bDate = b.lastMessage?.createdAt || b.createdAt;
  return compareDatesDesc(aDate, bDate);
}

export function userSelector(state, userIds: string[]) {
  return userIds.map((id) => (state.normalized.users || {})[id]);
}

export const isOneOnOneSelector = createSelector(
  [(state, channelId: string) => channelSelector(channelId)(state)],
  (channel) => isOneOnOne(channel)
);

export const oneOnOnesSelector = createSelector([conversationsListSelector], (channels) =>
  channels.filter((channel) => isOneOnOne(channel))
);
