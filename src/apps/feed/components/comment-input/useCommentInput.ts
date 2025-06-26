import { useDispatch, useSelector } from 'react-redux';

import { Media } from '../../../../components/message-input/utils';
import { SagaActionTypes } from '../../../../store/posts';
import { useSubmitPost } from '../../lib/useSubmitPost';
import { userProfileImageSelector } from '../../../../store/authentication/selectors';
import { activeConversationIdSelector } from '../../../../store/chat/selectors';

export const useCommentInput = (postId: string, channelZid?: string) => {
  const dispatch = useDispatch();

  const userProfileImageUrl = useSelector(userProfileImageSelector);

  const channelId = useSelector(activeConversationIdSelector);

  const { handleOnSubmit: handleOnSubmitPost } = useSubmitPost();

  const onSubmit = (message: string) => {
    dispatch({ type: SagaActionTypes.SendPost, payload: { channelId, replyToId: postId, message } });
  };

  const onSubmitFeed = (value: string, media: Media[]) => {
    handleOnSubmitPost({ message: value, media, channelZid, replyToId: postId });
  };

  return {
    onSubmit,
    onSubmitFeed,
    userProfileImageUrl,
  };
};
