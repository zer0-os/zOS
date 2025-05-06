import { useSelector } from 'react-redux';
import { useAccount, useSignMessage } from 'wagmi';
import { useMutation, useQueryClient } from '@tanstack/react-query';

import { Media } from '../../../components/message-input/utils';
import { SignedMessagePayload, uploadPost } from '../../../store/posts/utils';
import { uploadMedia } from '../../../store/posts/media-api';
import { POST_MAX_LENGTH } from './constants';
import { useThirdwebAccount } from '../../../store/thirdweb/account-manager';
import { featureFlags } from '../../../lib/feature-flags';
import { primaryZIDSelector, userWalletsSelector } from '../../../store/authentication/selectors';

interface SubmitPostParams {
  channelZid: string;
  media: Media[];
  message: string;
  replyToId?: string;
}

export const useSubmitPost = () => {
  const queryClient = useQueryClient();

  const userPrimaryZid = useSelector(primaryZIDSelector);
  const userWallets = useSelector(userWalletsSelector);

  const { address: connectedAddress } = useAccount();
  const { signMessageAsync } = useSignMessage();
  const account = useThirdwebAccount();

  const {
    error,
    isPending,
    mutate: handleOnSubmit,
  } = useMutation({
    /**
     * @note this mutation function is an almost exact copy of the saga logic. This will be refactored in the future.
     */
    mutationFn: async ({ message, replyToId, channelZid, media }: SubmitPostParams) => {
      const formattedUserPrimaryZid = userPrimaryZid.replace('0://', '');

      const authorAddress = featureFlags.enableZeroWalletSigning ? account?.address : connectedAddress;

      if (!formattedUserPrimaryZid) {
        throw new Error('Please set a primary ZID in your profile');
      }

      if (!channelZid) {
        throw new Error('Channel ZID is invalid');
      }

      if (!message || message.trim() === '') {
        throw new Error(!media ? 'Post is empty' : 'Please add a message to your post');
      }

      if (media && media.length > 1) {
        throw new Error('Only one media file is supported at the moment');
      }

      if (message.length > POST_MAX_LENGTH) {
        throw new Error(`Post must be less than ${POST_MAX_LENGTH} characters`);
      }

      if (!authorAddress) {
        throw new Error('ZERO wallet is not connected');
      }

      if (!userWallets.find((w) => w.publicAddress.toLowerCase() === authorAddress.toLowerCase())) {
        throw new Error('Wallet is not linked to your account');
      }

      // Handle media upload first if present
      let mediaId: string | undefined;
      if (media && media.length > 0) {
        try {
          const file = media[0].nativeFile;
          if (!file) {
            if (media[0].giphy) {
              const response = await fetch(media[0].giphy.images.original.url);
              const blob = await response.blob();
              const gifFile = new File([blob], `${media[0].giphy.id}.gif`, { type: 'image/gif' });
              const uploadResponse = await uploadMedia(gifFile);
              mediaId = uploadResponse.id;
            } else {
              throw new Error('Media file is missing');
            }
          } else {
            const uploadResponse = await uploadMedia(file);
            mediaId = uploadResponse.id;
          }
        } catch (e) {
          console.error('Failed to upload media:', e);
          throw new Error('Failed to upload media');
        }
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
        if (featureFlags.enableZeroWalletSigning) {
          signedPost = await account?.signMessage({ message: unsignedPost });
        } else {
          signedPost = await signMessageAsync({ account: authorAddress, message: unsignedPost });
        }
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
    onSuccess: (_data, { replyToId, channelZid }) => {
      queryClient.invalidateQueries({ queryKey: ['posts', { zid: channelZid }] });
      queryClient.invalidateQueries({ queryKey: ['posts', 'replies', { postId: replyToId }] });

      // Also invalidate the "Everything" feed. This is a bit of a hack! Ideally we shouldn't
      // invalidate this feed every time a post is submitted. We should only invalidate it when
      // the user posts in the "Everything" feed.
      queryClient.invalidateQueries({ queryKey: ['posts', { zid: undefined }] });
    },
  });

  return {
    error,
    handleOnSubmit,
    isLoading: isPending,
  };
};
