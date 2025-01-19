import { useSelector } from 'react-redux';
import { useAccount, useSignMessage } from 'wagmi';
import { useMutation, useQueryClient } from '@tanstack/react-query';

import { Media } from '../../../components/message-input/utils';
import { RootState } from '../../../store';
import { SignedMessagePayload, uploadPost } from '../../../store/posts/utils';

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

      if (!formattedUserPrimaryZid) {
        throw new Error('Please set a primary ZID in your profile');
      }

      if (!channelZid) {
        throw new Error('Channel ZID is invalid');
      }

      if (!message || message.trim() === '') {
        throw new Error('Post is empty');
      }

      if (!userWallets.find((w) => w.publicAddress.toLowerCase() === connectedAddress.toLowerCase())) {
        throw new Error('Wallet is not linked to your account');
      }

      const createdAt = new Date().getTime();

      const payloadToSign: SignedMessagePayload = {
        created_at: createdAt.toString(),
        text: message,
        wallet_address: connectedAddress,
        zid: formattedUserPrimaryZid,
      };

      const unsignedPost = JSON.stringify(payloadToSign);
      let signedPost;

      try {
        signedPost = await signMessageAsync({ account: connectedAddress, message: unsignedPost });
      } catch (e) {
        console.error(e);
        throw new Error('Failed to sign post');
      }

      const formData = new FormData();

      formData.append('text', message);
      formData.append('unsignedMessage', unsignedPost);
      formData.append('signedMessage', signedPost);
      formData.append('zid', formattedUserPrimaryZid);
      formData.append('walletAddress', connectedAddress);
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
    },
  });

  return {
    error,
    handleOnSubmit,
    isLoading: isPending,
  };
};
