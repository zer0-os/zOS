import { takeLatest, call, select, put } from 'redux-saga/effects';
import uniqBy from 'lodash.uniqby';
import BN from 'bn.js';

import { SagaActionTypes, setError } from '.';
import { MediaType } from '../messages';
import { messageSelector, rawMessagesSelector } from '../messages/saga';
import { currentUserSelector } from '../authentication/saga';
import { rawChannelSelector, receiveChannel } from '../channels/saga';
import { ConversationStatus, MessagesFetchState } from '../channels';
import { SagaActionTypes as ChannelsEvents } from '../channels';
import { updateUserMeowBalance } from '../rewards/saga';
import { POSTS_PAGE_SIZE } from './constants';
import { setIsSubmitting } from '.';
import {
  getWallet,
  mapPostToMatrixMessage,
  SignedMessagePayload,
  signPostPayload,
  uploadPost,
  meowPost as meowPostApi,
  getPostsInChannel,
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
  const { channelId, message } = action.payload;

  const channel = yield select(rawChannelSelector(channelId));

  if (channel.conversationStatus !== ConversationStatus.CREATED) {
    return;
  }

  yield put(setIsSubmitting(true));
  yield put(setError(undefined));

  try {
    const user = yield select(currentUserSelector());
    const userZid = user.primaryZID?.split('0://')?.[1];

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

export function* fetchPosts(action) {
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
    const skip = currentPage * POSTS_PAGE_SIZE;
    const limit = POSTS_PAGE_SIZE;

    const fetchedPosts = yield call(getPostsInChannel, channelZna, limit, skip);
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

function* reset() {
  yield put(setError(undefined));
  yield put(setIsSubmitting(false));
}

export function* saga() {
  yield takeLatest(SagaActionTypes.SendPost, sendPost);
  yield takeLatest(SagaActionTypes.FetchPosts, fetchPosts);
  yield takeLatest(SagaActionTypes.MeowPost, meowPost);
  yield takeLatest(ChannelsEvents.OpenConversation, reset);
}
