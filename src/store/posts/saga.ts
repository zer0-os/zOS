import { takeLatest, call, select } from 'redux-saga/effects';

import { SagaActionTypes } from '.';
import { MediaType, Message } from '../messages';
import { getPostMessageReactions, sendPostByChannelId } from '../../lib/chat';
import { messageSelector, rawMessagesSelector, sendMessage } from '../messages/saga';
import { currentUserSelector } from '../authentication/saga';
import { createOptimisticPostObject } from './utils';
import { rawChannelSelector, receiveChannel } from '../channels/saga';
import { ConversationStatus, MessagesFetchState } from '../channels';
import { Uploadable, createUploadableFile } from '../messages/uploadable';
import { Events as ChatEvents, getChatBus } from '../chat/bus';
import { takeEveryFromBus } from '../../lib/saga';
import { updateUserMeowBalance } from '../rewards/saga';
import { get } from '../../lib/api/rest';

export interface Payload {
  channelId: string;
  referenceTimestamp?: number;
  messageId?: number;
}

interface MediaInfo {
  nativeFile?: File;
  giphy?: any;
  name: string;
  url: string;
  mediaType: MediaType;
}

export interface PostPayload {
  channelId?: string;
  message?: string;
  files?: MediaInfo[];
  optimisticId?: string;
}

export function* sendPost(action) {
  const { channelId, message, files = [] } = action.payload;

  const processedFiles: Uploadable[] = files.map(createUploadableFile);

  // Create optimistic posts (for both the text and media files)
  const { optimisticPost, uploadableFiles } = yield call(createOptimisticPosts, channelId, message, processedFiles);

  let rootMessageId = '';
  if (optimisticPost) {
    // If the text post is created, send it first
    const textPost = yield call(sendPostByChannelId, channelId, message, optimisticPost.optimisticId);

    if (textPost) {
      rootMessageId = textPost.id;
    } else {
      // If the text post fails, shift the first file to avoid sending it
      uploadableFiles.shift();
    }
  }

  // Upload the media files after sending the text post
  yield call(uploadFileMessages, channelId, rootMessageId, uploadableFiles, true);
}

export function* createOptimisticPosts(channelId, postText, uploadableFiles?) {
  let optimisticPost = null;

  // Create optimistic post for text
  if (postText?.trim()) {
    const { optimisticPost: createdOptimisticPost } = yield call(createOptimisticPost, channelId, postText);
    optimisticPost = createdOptimisticPost;
  }

  // Create optimistic posts for each media file
  for (const index in uploadableFiles) {
    const file = uploadableFiles[index].file;
    // Root the first media file to the optimistic post, others stand alone
    const rootId = index === '0' ? optimisticPost?.id : '';
    const { optimisticPost: optimisticFilePost } = yield call(createOptimisticPost, channelId, '', file, rootId);
    uploadableFiles[index].optimisticMessage = optimisticFilePost;
  }

  return { optimisticPost, uploadableFiles };
}

export function* createOptimisticPost(channelId, postText, file = null, rootMessageId = null) {
  const existingMessages = yield select(rawMessagesSelector(channelId));
  const currentUser = yield select(currentUserSelector());

  const optimisticPost = createOptimisticPostObject(postText, currentUser, file, rootMessageId);

  yield call(receiveChannel, { id: channelId, messages: [...existingMessages, optimisticPost] });

  return { optimisticPost };
}

export function* uploadFileMessages(channelId, rootMessageId, uploadableFiles: Uploadable[], isPost = false) {
  for (const uploadableFile of uploadableFiles) {
    const upload = call([uploadableFile, 'upload'], channelId, rootMessageId, isPost);
    yield sendMessage(upload, channelId, uploadableFile.optimisticMessage.id);
    rootMessageId = '';
  }
}

export function* fetchPosts(action) {
  const { channelId } = action.payload;
  const channel = yield select(rawChannelSelector(channelId));

  if (channel.conversationStatus !== ConversationStatus.CREATED) {
    return;
  }

  const channelZna = channel.name?.split('0://')[1];

  let posts;
  const PAGE_SIZE = 20;

  try {
    /* Grab existing posts from state, and filter out any Matrix posts.
     * This is a temporary work around so we can continue to use the existing
     * post business logic. */
    const existingPosts = yield select(rawMessagesSelector(channelId));
    const filteredPosts = existingPosts.filter((m) => !m.startsWith('$'));

    // Calculate the current page number
    const currentPage = Math.floor(filteredPosts.length / PAGE_SIZE);

    const endpoint = `/api/v2/posts/channel/${channelZna}`;

    const res = yield call(get, endpoint, undefined, {
      limit: PAGE_SIZE,
      skip: currentPage * PAGE_SIZE,
    });

    if (!res.ok) {
      yield call(receiveChannel, {
        id: channelId,
        messages: filteredPosts,
        hasMorePosts: false,
        hasLoadedMessages: true,
        messagesFetchStatus: MessagesFetchState.FAILED,
      });
    }

    const irysPosts = res.body.posts;

    const messagePosts: Message[] = irysPosts.map((post) => ({
      createdAt: post.createdAt,
      hidePreview: false,
      id: post.id,
      image: undefined,
      isAdmin: false,
      isPost: true,
      media: null,
      mentionedUsers: [],
      message: post.text,
      optimisticId: post.id,
      preview: null,
      reactions: {},
      rootMessageId: '',
      sendStatus: 0,
      sender: {
        userId: post.userId,
        firstName: post.user.handle,
        displaySubHandle: '0://' + post.zid,
      },
    }));

    posts = [...messagePosts, ...filteredPosts];

    const hasMorePosts = irysPosts.length === PAGE_SIZE;

    // Updates the channel's state with the fetched posts and existing non-post messages
    yield call(receiveChannel, {
      id: channelId,
      messages: posts,
      hasMorePosts,
      hasLoadedMessages: true,
      messagesFetchStatus: MessagesFetchState.SUCCESS,
    });
  } catch (error) {
    console.log('Error fetching posts', error);
    yield call(receiveChannel, { id: channelId, messagesFetchStatus: MessagesFetchState.FAILED });
  }
}

export function* applyReactions(roomId: string, postMessages: Message[]): Generator<any, void, any> {
  const reactions = yield call(getPostMessageReactions, roomId);

  postMessages.forEach((postMessage) => {
    const relatedReactions = reactions.filter((reaction) => reaction.eventId === postMessage.id.toString());
    if (relatedReactions.length > 0) {
      postMessage.reactions = relatedReactions.reduce((acc, reaction) => {
        const key = reaction.key.split('_')[0]; // Base key without the unique part for MEOWS
        const amount = parseFloat(reaction.amount);
        acc[key] = (acc[key] || 0) + amount;
        return acc;
      }, postMessage.reactions || {});
    }
  });
}

export function* updatePostMessageReaction(roomId, { eventId, key, amount, postOwnerId }) {
  const postMessage = yield select(messageSelector(eventId));
  const existingMessages = yield select(rawMessagesSelector(roomId));

  if (postMessage) {
    const newReactions = { ...postMessage.reactions };
    const baseKey = key.split('_')[0]; // Base key without the unique part for MEOWS
    newReactions[baseKey] = (newReactions[baseKey] || 0) + amount;

    const updatedMessage = { ...postMessage, reactions: newReactions };
    const updatedMessages = existingMessages.map((message) => (message === eventId ? updatedMessage : message));

    yield call(receiveChannel, { id: roomId, messages: updatedMessages });

    // Update the user's MEOW balance if they are the post owner
    yield call(updateUserMeowBalance, postOwnerId, amount);
  }
}

function* onPostMessageReactionChange(action) {
  const { roomId, reaction } = action.payload;
  yield call(updatePostMessageReaction, roomId, reaction);
}

export function* saga() {
  yield takeLatest(SagaActionTypes.SendPost, sendPost);
  yield takeLatest(SagaActionTypes.FetchPosts, fetchPosts);

  yield takeEveryFromBus(yield call(getChatBus), ChatEvents.PostMessageReactionChange, onPostMessageReactionChange);
}
