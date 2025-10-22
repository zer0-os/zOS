import { useDispatch, useSelector } from 'react-redux';

import { SagaActionTypes } from '../../../../store/posts';
import { useSubmitPost } from '../../lib/useSubmitPost';
import { userProfileImageSelector, currentUserSelector } from '../../../../store/authentication/selectors';
import { activeConversationIdSelector } from '../../../../store/chat/selectors';

export const useCommentInput = (postId: string, channelZid?: string) => {
  const dispatch = useDispatch();

  const userProfileImageUrl = useSelector(userProfileImageSelector);
  const currentUser = useSelector(currentUserSelector);

  const channelId = useSelector(activeConversationIdSelector);

  const { handleOnSubmit: handleOnSubmitPost } = useSubmitPost();

  const onSubmit = (message: string) => {
    dispatch({ type: SagaActionTypes.SendPost, payload: { channelId, replyToId: postId, message } });
  };

  const onSubmitFeed = (value: string, mediaId?: string) => {
    // Use channelZid if provided, otherwise fallback to Z wallet
    const fallbackChannelZid = channelZid || currentUser?.zeroWalletAddress;
    handleOnSubmitPost({ message: value, mediaId, channelZid: fallbackChannelZid, replyToId: postId });
  };

  return {
    onSubmit,
    onSubmitFeed,
    userProfileImageUrl,
  };
};
