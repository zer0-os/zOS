import { takeLatest, call, put, select } from 'redux-saga/effects';
import uniqBy from 'lodash.uniqby';

import { SagaActionTypes } from '.';
import { MessageSendStatus, receive as receiveMessage } from '../messages';
import { getPostMessagesByChannelId, sendPostByChannelId } from '../../lib/chat';
import { rawMessagesSelector } from '../messages/saga';
import { currentUserSelector } from '../authentication/saga';
import { createOptimisticPostObject } from './utils';
import { rawChannelSelector, receiveChannel } from '../channels/saga';
import { ConversationStatus, MessagesFetchState } from '../channels';
import { mapMessageSenders } from '../messages/utils.matrix';

export interface Payload {
  channelId: string;
  referenceTimestamp?: number;
  messageId?: number;
}

export interface PostPayload {
  channelId?: string;
  message?: string;
  optimisticId?: string;
}

export function* sendPost(action) {
  const { channelId, message } = action.payload;

  const { optimisticPost } = yield call(createOptimisticPost, channelId, message);

  try {
    yield call(sendPostByChannelId, channelId, message, optimisticPost.optimisticId);
  } catch (error) {
    console.error('Failed to send post:', error);
    yield put(receiveMessage({ id: optimisticPost.optimisticId, sendStatus: MessageSendStatus.FAILED }));
  }
}

export function* createOptimisticPost(channelId, postText) {
  const existingMessages = yield select(rawMessagesSelector(channelId));
  const currentUser = yield select(currentUserSelector());

  const optimisticPost = createOptimisticPostObject(postText, currentUser);

  yield call(receiveChannel, { id: channelId, messages: [...existingMessages, optimisticPost] });

  return { optimisticPost };
}

export function* fetchPosts(action) {
  const { channelId, referenceTimestamp } = action.payload;
  const channel = yield select(rawChannelSelector(channelId));

  if (channel.conversationStatus !== ConversationStatus.CREATED) {
    return;
  }

  let postsResponse;
  let posts;

  try {
    if (referenceTimestamp) {
      yield call(receiveChannel, { id: channelId, messagesFetchStatus: MessagesFetchState.MORE_IN_PROGRESS });
      postsResponse = yield call(getPostMessagesByChannelId, channelId, referenceTimestamp);
    } else {
      yield call(receiveChannel, { id: channelId, messagesFetchStatus: MessagesFetchState.IN_PROGRESS });
      postsResponse = yield call(getPostMessagesByChannelId, channelId);
    }

    yield call(mapMessageSenders, postsResponse.postMessages, channelId);

    const existingMessages = yield select(rawMessagesSelector(channelId));
    const existingPosts = existingMessages.filter((message) => message.isPost);

    posts = uniqBy([...postsResponse.postMessages, ...existingPosts], (p) => p.id ?? p);

    // Updates the channel's state with the fetched posts and existing non-post messages
    const nonPostMessages = existingMessages.filter((message) => !message.isPost);
    yield call(receiveChannel, {
      id: channelId,
      messages: uniqBy([...posts, ...nonPostMessages], (m) => m.id ?? m),
      hasMorePosts: postsResponse.hasMore,
      hasLoadedMessages: true,
      messagesFetchStatus: MessagesFetchState.SUCCESS,
    });
  } catch (error) {
    yield call(receiveChannel, { id: channelId, messagesFetchStatus: MessagesFetchState.FAILED });
  }
}

export function* saga() {
  yield takeLatest(SagaActionTypes.SendPost, sendPost);
  yield takeLatest(SagaActionTypes.FetchPosts, fetchPosts);
}
