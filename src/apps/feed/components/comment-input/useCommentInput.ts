import { useDispatch, useSelector } from 'react-redux';

import { Media } from '../../../../components/message-input/utils';
import { RootState } from '../../../../store';
import { SagaActionTypes } from '../../../../store/posts';
import { useSubmitPost } from '../../lib/useSubmitPost';

export const useCommentInput = (postId: string, channelZid?: string) => {
  const dispatch = useDispatch();

  const userProfileImageUrl = useSelector(
    (state: RootState) => state.authentication.user.data?.profileSummary?.profileImage
  );

  const channelId = useSelector((state: RootState) => state.chat.activeConversationId);
  const error = useSelector((state: RootState) => state.posts.error);
  const isLoading = useSelector((state: RootState) => state.posts.isSubmitting);

  const { handleOnSubmit: handleOnSubmitPost, isLoading: isLoadingFeed, error: errorFeed } = useSubmitPost();

  const onSubmit = (message: string) => {
    dispatch({ type: SagaActionTypes.SendPost, payload: { channelId, replyToId: postId, message } });
  };

  const onSubmitFeed = (value: string, media: Media[]) => {
    handleOnSubmitPost({ message: value, media, channelZid, replyToId: postId });
  };

  return {
    error,
    errorFeed,
    isLoading,
    isLoadingFeed,
    onSubmit,
    onSubmitFeed,
    userProfileImageUrl,
  };
};
