import { useSubmitPost } from '../../lib/useSubmitPost';
import { useSelector } from 'react-redux';
import { userProfileImageSelector } from '../../../../store/authentication/selectors';

export const usePostInput = (channelZid: string, replyToId?: string) => {
  const userProfileImageUrl = useSelector(userProfileImageSelector);
  const { handleOnSubmit: handleOnSubmitPost } = useSubmitPost();

  const handleOnSubmit = (value: string, mediaId?: string) => {
    handleOnSubmitPost({ channelZid, mediaId, message: value, replyToId });
  };

  return {
    handleOnSubmit,
    userProfileImageUrl,
  };
};
