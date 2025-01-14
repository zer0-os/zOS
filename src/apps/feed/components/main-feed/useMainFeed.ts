import { useDispatch, useSelector } from 'react-redux';
import { SagaActionTypes } from '../../../../store/posts';
import { RootState } from '../../../../store';
import { Media } from '../../../../components/message-input/utils';

export const useMainFeed = () => {
  const dispatch = useDispatch();

  const activeConversationId = useSelector((state: RootState) => state.chat.activeConversationId);
  const isSubmittingPost = useSelector((state: RootState) => state.posts.isSubmitting);

  const onSubmitPost = (message: string, media: Media[] = []) => {
    dispatch({
      type: SagaActionTypes.SendPost,
      payload: { channelId: activeConversationId, message: message, files: media },
    });
  };

  return {
    activeConversationId,
    isSubmittingPost,
    onSubmitPost,
  };
};
