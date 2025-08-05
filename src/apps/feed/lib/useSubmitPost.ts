import { useSelector, useDispatch } from 'react-redux';
import { useMutation, useQueryClient } from '@tanstack/react-query';

import { SignedMessagePayload, uploadPost } from '../../../store/posts/utils';
import { useThirdwebAccount } from '../../../store/thirdweb/account-manager';
import { currentUserSelector, primaryZIDSelector, userWalletsSelector } from '../../../store/authentication/selectors';
import { v4 as uuidv4 } from 'uuid';
import { addQueuedPost, removeQueuedPost, updateQueuedPostStatus } from '../../../store/post-queue';
import { QuotedPost } from '../components/feed/lib/types';

export interface SubmitPostParams {
  channelZid: string;
  mediaId?: string;
  message: string;
  replyToId?: string;
  quoteOf?: string;
  quotingPost?: QuotedPost;
}

export const useSubmitPost = () => {
  const queryClient = useQueryClient();
  const dispatch = useDispatch();

  const userPrimaryZid = useSelector(primaryZIDSelector);
  const userWallets = useSelector(userWalletsSelector);
  const currentUser = useSelector(currentUserSelector);

  const account = useThirdwebAccount();

  const {
    error,
    isPending,
    mutate: handleOnSubmit,
  } = useMutation({
    /**
     * @note this mutation function is an almost exact copy of the saga logic. This will be refactored in the future.
     */
    mutationFn: async (params: SubmitPostParams) => {
      const { message, replyToId, channelZid, mediaId, quoteOf } = params;
      const formattedUserPrimaryZid = userPrimaryZid?.replace('0://', '');

      const authorAddress = account?.address;

      if (!formattedUserPrimaryZid) {
        throw new Error('Please set a primary ZID in your profile');
      }

      if (!channelZid) {
        throw new Error('Channel ZID is invalid');
      }

      if (!authorAddress) {
        throw new Error('ZERO wallet is not connected');
      }

      if (!userWallets.find((w) => w.publicAddress.toLowerCase() === authorAddress.toLowerCase())) {
        throw new Error('Wallet is not linked to your account');
      }

      const createdAt = new Date().getTime();

      const payloadToSign: SignedMessagePayload = {
        created_at: createdAt.toString(),
        text: message,
        wallet_address: authorAddress,
        zid: formattedUserPrimaryZid,
      };

      const unsignedPost = JSON.stringify(payloadToSign);
      let signedPost;

      try {
        signedPost = await account?.signMessage({ message: unsignedPost });
      } catch (e) {
        console.error(e);
        throw new Error('Failed to sign post');
      }

      const formData = new FormData();

      formData.append('text', message);
      formData.append('unsignedMessage', unsignedPost);
      formData.append('signedMessage', signedPost);
      formData.append('zid', formattedUserPrimaryZid);
      formData.append('walletAddress', authorAddress);
      if (quoteOf) {
        formData.append('quoteOf', quoteOf);
      }
      if (replyToId) {
        formData.append('replyTo', replyToId);
      }
      if (mediaId) {
        formData.append('mediaId', mediaId);
      }

      let res;

      try {
        res = await uploadPost(formData, channelZid);

        if (!res) {
          throw new Error('Failed to submit post');
        }

        return res;
      } catch (e) {
        throw new Error((e as any).message ?? 'Failed to submit post');
      }
    },
    onMutate: async (params: SubmitPostParams) => {
      const { channelZid, message, replyToId, mediaId, quotingPost } = params;
      await queryClient.cancelQueries({ queryKey: ['posts', { zid: channelZid }] });

      if (replyToId) {
        await queryClient.cancelQueries({ queryKey: ['posts', 'replies', { postId: replyToId }] });
      }

      const formattedZid = currentUser?.primaryZID?.replace('0://', '');

      const optimisticId = uuidv4();

      const optimisticPost = {
        createdAt: new Date().toISOString(),
        hidePreview: false,
        id: optimisticId,
        isAdmin: false,
        isPost: true,
        message,
        mediaId,
        optimisticId: optimisticId,
        reactions: {
          MEOW: 0,
          VOTED: 0,
        },
        sender: {
          userId: currentUser?.id,
          firstName: currentUser?.profileSummary?.firstName,
          displaySubHandle: currentUser?.primaryZID,
          avatarUrl: currentUser?.profileSummary?.profileImage,
          primaryZid: formattedZid,
          publicAddress: currentUser?.primaryWalletAddress,
          isZeroProSubscriber: false,
        },
        numberOfReplies: 0,
        channelZid: channelZid?.replace('0://', ''),
        arweaveId: uuidv4(),
        quoteOf: quotingPost?.id,
        quotedPost: quotingPost,
      };

      dispatch(
        addQueuedPost({
          id: optimisticId,
          optimisticPost,
          params,
          feedZid: channelZid,
          replyToId,
          status: 'pending',
        })
      );

      return { optimisticId };
    },
    onSuccess: (_data, { replyToId, channelZid }, { optimisticId }) => {
      dispatch(removeQueuedPost(optimisticId));

      queryClient.invalidateQueries({ queryKey: ['posts', { zid: channelZid }] });

      if (replyToId) {
        queryClient.invalidateQueries({ queryKey: ['posts', 'replies', { postId: replyToId }] });
      }

      // Also invalidate the "Everything" feed. This is a bit of a hack! Ideally we shouldn't
      // invalidate this feed every time a post is submitted. We should only invalidate it when
      // the user posts in the "Everything" feed.
      queryClient.invalidateQueries({ queryKey: ['posts', { zid: undefined }] });
    },
    onError: (error, _variables, { optimisticId }) => {
      dispatch(
        updateQueuedPostStatus({
          tempId: optimisticId,
          status: 'failed',
          error: error.message,
        })
      );
    },
  });

  return {
    error,
    handleOnSubmit,
    isLoading: isPending,
  };
};
