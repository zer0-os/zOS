import { useAccount } from 'wagmi';

import { useSubmitPost } from '../../lib/useSubmitPost';
import { Media } from '../../../../components/message-input/utils';

export const usePostInput = (channelZid: string, replyToId?: string) => {
  const { isConnected } = useAccount();
  const { error, handleOnSubmit: handleOnSubmitPost, isLoading } = useSubmitPost();

  const handleOnSubmit = (value: string, media: Media[]) => {
    handleOnSubmitPost({ channelZid, media, message: value, replyToId });
  };

  return {
    error,
    handleOnSubmit,
    isLoading,
    isWalletConnected: isConnected,
  };
};
