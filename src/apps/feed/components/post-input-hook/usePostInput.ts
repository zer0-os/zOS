import { useSubmitPost } from '../../lib/useSubmitPost';
import { Media } from '../../../../components/message-input/utils';
import { useSelector } from 'react-redux';
import { userProfileImageSelector } from '../../../../store/authentication/selectors';

export const usePostInput = (channelZid: string, replyToId?: string) => {
  const userProfileImageUrl = useSelector(userProfileImageSelector);
  const { error, handleOnSubmit: handleOnSubmitPost, isLoading } = useSubmitPost();

  const handleOnSubmit = (value: string, media: Media[]) => {
    handleOnSubmitPost({ channelZid, media, message: value, replyToId });
  };

  return {
    error,
    handleOnSubmit,
    isLoading,
    userProfileImageUrl,
  };
};
