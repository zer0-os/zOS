import { useSubmitPost } from '../../lib/useSubmitPost';
import { useSelector } from 'react-redux';
import { userProfileImageSelector } from '../../../../store/authentication/selectors';
import { qoutingPostSelector } from '../../../../store/posts/selectors';

export const usePostInput = (
  channelZid: string,
  replyToId?: string,
  onSubmit?: (message: string, mediaId?: string) => void
) => {
  const quotingPost = useSelector(qoutingPostSelector);
  const userProfileImageUrl = useSelector(userProfileImageSelector);
  const { handleOnSubmit: handleOnSubmitPost } = useSubmitPost();

  const handleOnSubmit = (value: string, mediaId?: string) => {
    handleOnSubmitPost({ channelZid, mediaId, message: value, replyToId, quoteOf: quotingPost?.id, quotingPost });
    onSubmit?.(value, mediaId);
  };

  return {
    handleOnSubmit,
    userProfileImageUrl,
    quotingPost,
  };
};
