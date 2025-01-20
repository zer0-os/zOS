import { WalletClient } from 'viem';
import { get, post } from '../../lib/api/rest';
import { getWagmiConfig } from '../../lib/web3/wagmi-config';
import { getWalletClient } from '@wagmi/core';
import { ethers } from 'ethers';

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
      avatarUrl: post.user?.profileSummary?.profileImage,
    },
    replyTo: post.replyToPost,
    numberOfReplies: post.replies?.length ?? 0,
    channelZid: post.worldZid,
    arweaveId: post.arweaveId,
  };
}

/**
 * Uploads a post as FormData to the zOS API.
 * @param formData The parameters of the post to upload.
 * @param worldZid The world ZID to upload the post to.
 */
export async function uploadPost(formData: FormData, worldZid: string) {
  return new Promise(async (resolve, reject) => {
    const endpoint = `/api/v2/posts/channel/${worldZid}`;

    let request = post(endpoint)
      .field('text', formData.get('text'))
      .field('unsignedMessage', formData.get('unsignedMessage'))
      .field('signedMessage', formData.get('signedMessage'))
      .field('zid', formData.get('zid'))
      .field('walletAddress', formData.get('walletAddress'));

    const replyTo = formData.get('replyTo');
    if (replyTo) {
      request = request.field('replyTo', replyTo);
    }

    request.end((err, res) => {
      if (err) {
        reject(new Error(res.body.message ?? 'Failed to upload post'));
      } else {
        resolve(res.body);
      }
    });
  });
}

export async function getWallet() {
  const wagmiConfig = getWagmiConfig();
  const walletClient: WalletClient = await getWalletClient(wagmiConfig);

  return walletClient;
}

/**
 * "MEOW"s a post in the API.
 * @param postId the post to "MEOW"
 * @param meowAmount the amount of MEOW to send
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

/**
 * Gets posts in a channel from the API.
 * @param channelZna the channel to get posts from
 * @param limit the maximum number of posts to get
 * @param skip the number of posts to skip
 */
export async function getPostsInChannel(channelZna: string, limit: number, skip: number) {
  const endpoint = `/api/v2/posts/channel/${channelZna}`;

  try {
    const res = await get(endpoint, undefined, { limit, skip, include_replies: true, include_meows: true });

    if (!res.ok || !res.body) {
      throw new Error(res);
    }

    return res.body.posts;
  } catch (e) {
    console.error('Failed to fetch posts', e);
    throw new Error('Failed to fetch posts');
  }
}

/**
 * Gets a post from the API.
 * @param postId the post to fetch
 */
export async function getPost(postId: string) {
  const endpoint = `/api/v2/posts/${postId}`;

  try {
    const res = await get(endpoint, undefined, { include_replies: true, include_meows: true });
    return res.body;
  } catch (e) {
    console.error('Failed to fetch post', e);
    throw new Error('Failed to fetch post');
  }
}

export async function getPostReplies(postId: string, { limit, skip }: { limit: number; skip: number }) {
  const endpoint = `/api/v2/posts/${postId}/replies`;
  const res = await get(endpoint, undefined, { limit, skip, include_replies: true, include_meows: true });
  return res.body;
}
