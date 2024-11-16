import { takeLatest, call, select } from 'redux-saga/effects';

import { SagaActionTypes } from '.';
import { MediaType, Message } from '../messages';
import { getPostMessageReactions } from '../../lib/chat';
import { messageSelector, rawMessagesSelector, sendMessage } from '../messages/saga';
import { currentUserSelector } from '../authentication/saga';
import { createOptimisticPostObject } from './utils';
import { rawChannelSelector, receiveChannel } from '../channels/saga';
import { ConversationStatus, MessagesFetchState } from '../channels';
import { Uploadable } from '../messages/uploadable';
import { Events as ChatEvents, getChatBus } from '../chat/bus';
import { takeEveryFromBus } from '../../lib/saga';
import { updateUserMeowBalance } from '../rewards/saga';
import { get, post } from '../../lib/api/rest';
import { getWagmiConfig } from '../../lib/web3/wagmi-config';
import { WalletClient } from 'viem';
import { getWalletClient } from '@wagmi/core';

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

interface SignedMessagePayload {
  created_at: string;
  text: string;
  wallet_address: string;
  zid: string;
}

async function signPostPayload(
  payload: SignedMessagePayload,
  walletClient: WalletClient
): Promise<{ signedPost: string; unsignedPost: string }> {
  const unsignedPost = JSON.stringify(payload);
  const signedPost = await walletClient.signMessage({
    account: payload.wallet_address as `0x${string}`,
    message: unsignedPost,
  });

  return {
    unsignedPost,
    signedPost,
  };
}

function mapPost(post) {
  return {
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
  };
}

async function uploadPost(formData: FormData, worldZid: string) {
  const endpoint = `/api/v2/posts/channel/${worldZid}`;

  try {
    return await post(endpoint)
      .field('text', formData.get('text'))
      .field('unsignedMessage', formData.get('unsignedMessage'))
      .field('signedMessage', formData.get('signedMessage'))
      .field('zid', formData.get('zid'))
      .field('walletAddress', formData.get('walletAddress'));
  } catch (e) {
    console.error('Failed to upload post', e);
    throw new Error('Failed to upload post');
  }
}

async function getWallet() {
  const wagmiConfig = getWagmiConfig();
  const walletClient: WalletClient = await getWalletClient(wagmiConfig);

  return walletClient;
}

export function* sendPost(action) {
  const { channelId, message } = action.payload;

  const channel = yield select(rawChannelSelector(channelId));

  if (channel.conversationStatus !== ConversationStatus.CREATED) {
    return;
  }

  const user = yield select(currentUserSelector());
  const userZid = user.primaryZID.split('0://')[1];

  // If user does not have a primary ZID
  if (!userZid || userZid.trim() === '') {
    // throw an error
  }

  const channelZid = channel?.name?.split('0://')[1];

  // If the message contect is empty, or the channel does not have a name
  if (!message || message.trim() === '' || !channelZid) {
    // throw an error
  }

  const walletClient = yield call(getWallet);
  const connectedAddress = walletClient.account?.address;

  // If the user does not have a connected address
  if (!connectedAddress) {
    // throw an error
  }

  // If the user is connected to a wallet which is not linked to their account
  if (!user.wallets.find((w) => w.publicAddress.toLowerCase() === connectedAddress.toLowerCase())) {
    // throw an error
  }

  const createdAt = new Date().getTime();

  const formData = new FormData();

  const payloadToSign: SignedMessagePayload = {
    created_at: createdAt.toString(),
    text: message,
    wallet_address: connectedAddress,
    zid: userZid,
  };

  const { unsignedPost, signedPost } = yield call(signPostPayload, payloadToSign, walletClient);

  formData.append('text', message);
  formData.append('unsignedMessage', unsignedPost);
  formData.append('signedMessage', signedPost);
  formData.append('zid', userZid);
  formData.append('walletAddress', connectedAddress);

  const res = yield call(uploadPost, formData, channelZid);

  if (!res.ok) {
    throw new Error(`HTTP error! status: ${res.status}`);
  }

  const existingPosts = yield select(rawMessagesSelector(channelId));
  const filteredPosts = existingPosts.filter((m) => !m.startsWith('$'));

  yield call(receiveChannel, {
    id: channelId,
    messages: [
      ...filteredPosts,
      mapPost({
        createdAt,
        id: res.body.id,
        text: message,
        user: {
          handle: user.handle,
          userId: user.id,
        },
        zid: userZid,
      }),
    ],
  });
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

    const messagePosts: Message[] = irysPosts.map(mapPost);

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
