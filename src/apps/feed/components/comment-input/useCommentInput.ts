import { useDispatch, useSelector } from 'react-redux';

import { Media } from '../../../../components/message-input/utils';
import { RootState } from '../../../../store';
import { SagaActionTypes } from '../../../../store/posts';
import { useSubmitPost } from '../../lib/useSubmitPost';
import { userProfileImageSelector } from '../../../../store/authentication/selectors';
import { activeConversationIdSelector } from '../../../../store/chat/selectors';

const postErrorSelector = (state: RootState) => {
  return state.posts.error;
};

const postIsSubmittingSelector = (state: RootState) => {
  return state.posts.isSubmitting;
};

export const useCommentInput = (postId: string, channelZid?: string) => {
  const dispatch = useDispatch();

  const userProfileImageUrl = useSelector(userProfileImageSelector);

  const channelId = useSelector(activeConversationIdSelector);
  const error = useSelector(postErrorSelector);
  const isLoading = useSelector(postIsSubmittingSelector);

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
