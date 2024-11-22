import { v4 as uuidv4 } from 'uuid';

import { MediaType, Message, MessageSendStatus } from './../messages';
import { User } from './../authentication/types';
import { WalletClient } from 'viem';
import { post } from '../../lib/api/rest';
import { getWagmiConfig } from '../../lib/web3/wagmi-config';
import { getWalletClient } from '@wagmi/core';
import { ethers } from 'ethers';

export function createOptimisticPostObject(
  postText: string,
  user: User,
  file?: { name: string; url: string; mediaType: MediaType; giphy: any },
  rootMessageId?: string
): Message {
  const id = uuidv4();
  let media;

  if (file) {
    media = {
      type: file.mediaType,
      url: file.giphy ? file.giphy.images.downsized.url : file.url,
      name: file.name,
      height: 0,
      width: 0,
    };
  }

  return {
    createdAt: Date.now(),
    hidePreview: false,
    id,
    optimisticId: id,
    mentionedUsers: [],
    message: postText,
    isAdmin: false,
    sender: {
      userId: user.id,
      firstName: user.profileSummary.firstName,
      lastName: user.profileSummary.lastName,
      profileImage: user.profileSummary.profileImage,
      profileId: user.profileId,
      primaryZID: user.primaryZID,
    },
    updatedAt: 0,
    preview: null,
    media,
    sendStatus: MessageSendStatus.IN_PROGRESS,
    isPost: true,
    rootMessageId,
  };
}

export interface SignedMessagePayload {
  created_at: string;
  text: string;
  wallet_address: string;
  zid: string;
}

export async function signPostPayload(
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

/**
 * Maps an Irys post (from zOS API) to a Message object, so we can
 * re-use the existing Matrix business logic.
 *
 * Please note - types here are a bit funky.
 *
 * @param post Irys post to map
 * @returns Matrix Message object
 */
export function mapPostToMatrixMessage(post) {
  const meowCount = Math.round(Number(ethers.utils.formatEther(post.postsMeowsSummary?.totalMeowAmount ?? 0)));

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
    reactions: {
      MEOW: meowCount,
      VOTED: post.meows?.length ?? 0,
    },
    rootMessageId: '',
    sendStatus: 0,
    sender: {
      userId: post.userId,
      firstName: post.user?.profileSummary?.firstName,
      displaySubHandle: '0://' + post.zid,
    },
  };
}

/**
 * Uploads a post as FormData to the zOS API.
 * @param formData The parameters of the post to upload.
 * @param worldZid The world ZID to upload the post to.
 */
export async function uploadPost(formData: FormData, worldZid: string) {
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

export async function getWallet() {
  const wagmiConfig = getWagmiConfig();
  const walletClient: WalletClient = await getWalletClient(wagmiConfig);

  return walletClient;
}

/**
 * Uploads a post as FormData to the zOS API.
 * @param formData The parameters of the post to upload.
 * @param worldZid The world ZID to upload the post to.
 */
export async function meowPost(postId: string, meowAmount: string) {
  const endpoint = `/api/v2/posts/post/${postId}/meow`;

  try {
    return await post(endpoint).send({ amount: meowAmount });
  } catch (e) {
    console.error('Failed to upload post', e);
    throw new Error('Failed to upload post');
  }
}
