import { useSelector } from 'react-redux';
import { useAccount, useSignMessage } from 'wagmi';
import { useMutation, useQueryClient } from '@tanstack/react-query';

import { Media } from '../../../components/message-input/utils';
import { RootState } from '../../../store';
import { SignedMessagePayload, uploadPost } from '../../../store/posts/utils';
import { POST_MAX_LENGTH } from './constants';
import { useThirdwebAccount } from '../../../store/thirdweb/account-manager';
import { featureFlags } from '../../../lib/feature-flags';

interface SubmitPostParams {
  channelZid: string;
  media: Media[];
  message: string;
  replyToId?: string;
}

export const useSubmitPost = () => {
  const queryClient = useQueryClient();

  const { userPrimaryZid, userWallets } = useSelector((state: RootState) => ({
    userPrimaryZid: state.authentication.user.data?.primaryZID,
    userWallets: state.authentication.user.data?.wallets,
  }));

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
    mutationFn: async ({ message, replyToId, channelZid }: SubmitPostParams) => {
      const formattedUserPrimaryZid = userPrimaryZid.replace('0://', '');

      const authorAddress = featureFlags.enableZeroWalletSigning ? account?.address : connectedAddress;

      if (!formattedUserPrimaryZid) {
        throw new Error('Please set a primary ZID in your profile');
      }

      if (!channelZid) {
        throw new Error('Channel ZID is invalid');
      }

      if (!message || message.trim() === '') {
        throw new Error('Post is empty');
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

      let res;

      try {
        res = await uploadPost(formData, channelZid);

        if (!res) {
          throw new Error('Failed to submit post');
        }
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
