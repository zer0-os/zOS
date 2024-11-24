import { takeLatest, call, select, put } from 'redux-saga/effects';
import uniqBy from 'lodash.uniqby';
import BN from 'bn.js';

import { SagaActionTypes, setError } from '.';
import { MediaType, Message } from '../messages';
import { getPostMessageReactions, getPostMessagesByChannelId, sendPostByChannelId } from '../../lib/chat';
import { messageSelector, rawMessagesSelector, sendMessage } from '../messages/saga';
import { currentUserSelector } from '../authentication/saga';
import { rawChannelSelector, receiveChannel } from '../channels/saga';
import { ConversationStatus, MessagesFetchState } from '../channels';
import { createUploadableFile, Uploadable } from '../messages/uploadable';
import { Events as ChatEvents, getChatBus } from '../chat/bus';
import { SagaActionTypes as ChannelsEvents } from '../channels';
import { takeEveryFromBus } from '../../lib/saga';
import { updateUserMeowBalance } from '../rewards/saga';
import { get } from '../../lib/api/rest';
import { featureFlags } from '../../lib/feature-flags';
import { mapMessageSenders } from '../messages/utils.matrix';
import { POSTS_PAGE_SIZE } from './constants';
import { setIsSubmitting } from '.';
import {
  createOptimisticPostObject,
  getWallet,
  mapPostToMatrixMessage,
  SignedMessagePayload,
  signPostPayload,
  uploadPost,
  meowPost as meowPostApi,
} from './utils';
import { ethers } from 'ethers';

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

export function* sendPostIrys(action) {
  const { channelId, message } = action.payload;

  const channel = yield select(rawChannelSelector(channelId));

  if (channel.conversationStatus !== ConversationStatus.CREATED) {
    return;
  }

  yield put(setIsSubmitting(true));
  yield put(setError(undefined));

  try {
    const user = yield select(currentUserSelector());
    const userZid = user.primaryZID.split('0://')[1];

    // If user does not have a primary ZID
    if (!userZid || userZid.trim() === '') {
      throw new Error('Please set a primary ZID in your profile');
    }

    const channelZid = channel?.name?.split('0://')[1];

    // If channel does not have a name
    if (!channelZid) {
      throw new Error('Channel ZID is invalid');
    }

    // If the message contect is empty, or the channel does not have a name
    if (!message || message.trim() === '') {
      throw new Error('Post is empty');
    }

    let walletClient, connectedAddress;

    try {
      walletClient = yield call(getWallet);
      connectedAddress = walletClient.account?.address;
    } catch (e) {
      //
      throw new Error('Please connect a wallet');
    }

    // If the user does not have a connected address
    if (!connectedAddress) {
      throw new Error('Please connect a wallet');
    }

    // If the user is connected to a wallet which is not linked to their account
    if (!user.wallets.find((w) => w.publicAddress.toLowerCase() === connectedAddress.toLowerCase())) {
      throw new Error('Wallet is not linked to your account');
    }

    const createdAt = new Date().getTime();

    const formData = new FormData();

    const payloadToSign: SignedMessagePayload = {
      created_at: createdAt.toString(),
      text: message,
      wallet_address: connectedAddress,
      zid: userZid,
    };

    let unsignedPost, signedPost;

    try {
      const signatureResult = yield call(signPostPayload, payloadToSign, walletClient);
      unsignedPost = signatureResult.unsignedPost;
      signedPost = signatureResult.signedPost;
    } catch (e) {
      console.error(e);
      throw new Error('Failed to sign post');
    }

    formData.append('text', message);
    formData.append('unsignedMessage', unsignedPost);
    formData.append('signedMessage', signedPost);
    formData.append('zid', userZid);
    formData.append('walletAddress', connectedAddress);

    let res;

    try {
      res = yield call(uploadPost, formData, channelZid);

      if (!res) {
        throw new Error('Failed to submit post');
      }
    } catch (e) {
      throw new Error((e as any).message ?? 'Failed to submit post');
    }

    const existingPosts = yield select(rawMessagesSelector(channelId));
    const filteredPosts = existingPosts.filter((m) => !m.startsWith('$'));

    console.log('hello', user);

    yield call(receiveChannel, {
      id: channelId,
      messages: [
        ...filteredPosts,
        mapPostToMatrixMessage({
          createdAt,
          id: res.id,
          text: message,
          user: {
            profileSummary: {
              firstName: user.profileSummary?.firstName,
            },
          },
          userId: user.id,
          zid: userZid,
        }),
      ],
    });
  } catch (e) {
    yield put(setError((e as any).message ?? 'Failed to submit post'));
  }

  yield put(setIsSubmitting(false));
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

    if (featureFlags.enableMeows) {
      yield call(applyReactions, channelId, postsResponse.postMessages);
    }

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
    console.log('Error fetching posts', error);
    yield call(receiveChannel, { id: channelId, messagesFetchStatus: MessagesFetchState.FAILED });
  }
}

export function* fetchPostsIrys(action) {
  const { channelId } = action.payload;
  const channel = yield select(rawChannelSelector(action.payload.channelId));

  if (channel.conversationStatus !== ConversationStatus.CREATED) {
    return;
  }

  const channelZna = channel.name?.split('0://')[1];

  try {
    /* Grab existing posts from state, and filter out any Matrix posts.
     * This is a temporary work around so we can continue to use the existing
     * post business logic. */
    const existingPosts = yield select(rawMessagesSelector(channelId));
    const filteredPosts = existingPosts.filter((m) => !m.startsWith('$'));
    const currentPage = Math.floor(filteredPosts.length / POSTS_PAGE_SIZE);

    const res = yield call(get, `/api/v2/posts/channel/${channelZna}`, undefined, {
      limit: POSTS_PAGE_SIZE,
      skip: currentPage * POSTS_PAGE_SIZE,
    });

    if (!res.ok) {
      return yield call(receiveChannel, {
        id: channelId,
        hasMorePosts: false,
        hasLoadedMessages: true,
        messagesFetchStatus: MessagesFetchState.FAILED,
      });
    }

    const fetchedPosts = res.body.posts;
    const posts = uniqBy([...fetchedPosts.map(mapPostToMatrixMessage), ...filteredPosts], (p) => p.id ?? p);
    const hasMorePosts = fetchedPosts.length === POSTS_PAGE_SIZE;

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

function* meowPost(action) {
  const { postId, meowAmount, channelId } = action.payload;
  const user = yield select(currentUserSelector());

  if (!postMessage || !meowAmount || !user?.id) {
    return;
  }

  try {
    const meowAmountWei = ethers.utils.parseEther(meowAmount.toString());

    const existingPost = yield select(messageSelector(postId));
    const meow = new BN(existingPost.reactions.MEOW ?? 0).add(new BN(meowAmount)).toString();
    const updatedPost = { ...existingPost, reactions: { ...existingPost.reactions, MEOW: meow, VOTED: 1 } };

    const existingMessages = yield select(rawMessagesSelector(channelId));
    const updatedMessages = existingMessages.map((message) => (message === postId ? updatedPost : message));

    yield call(receiveChannel, { id: channelId, messages: updatedMessages });
    yield call(updateUserMeowBalance, existingPost.sender.userId, meowAmount);
    yield call(updateUserMeowBalance, user.id, Number(meowAmount ?? 0) * -1);

    const res = yield call(meowPostApi, postId, meowAmountWei.toString());

    if (!res.ok) {
      yield call(receiveChannel, { id: channelId, messages: existingMessages });
      yield call(updateUserMeowBalance, existingPost.sender.userId, Number(meowAmount) * -1);
      yield call(updateUserMeowBalance, user.id, Number(meowAmount));
      throw new Error('Failed to submit post');
    }
  } catch (e) {
    console.error(e);
  }
}

function* onPostMessageReactionChange(action) {
  const { roomId, reaction } = action.payload;
  yield call(updatePostMessageReaction, roomId, reaction);
}

function* reset() {
  yield put(setError(undefined));
  yield put(setIsSubmitting(false));
}

export function* saga() {
  yield takeLatest(SagaActionTypes.SendPostIrys, sendPostIrys);
  yield takeLatest(SagaActionTypes.FetchPostsIrys, fetchPostsIrys);
  yield takeLatest(SagaActionTypes.SendPost, sendPost);
  yield takeLatest(SagaActionTypes.FetchPosts, fetchPosts);
  yield takeLatest(SagaActionTypes.MeowPost, meowPost);
  yield takeLatest(ChannelsEvents.OpenConversation, reset);

  yield takeEveryFromBus(yield call(getChatBus), ChatEvents.PostMessageReactionChange, onPostMessageReactionChange);
}
