import { useDispatch, useSelector } from 'react-redux';
import { SagaActionTypes } from '../../../../../store/posts';
import { RootState } from '../../../../../store';
import { useAccount } from 'wagmi';

export const useCommentInput = (postId: string) => {
  const dispatch = useDispatch();
  const channelId = useSelector((state: RootState) => state.chat.activeConversationId);
  const error = useSelector((state: RootState) => state.posts.error);
  const { isConnected } = useAccount();

  const onSubmit = (message: string) => {
    dispatch({ type: SagaActionTypes.SendPost, payload: { channelId, replyToId: postId, message } });
  };

  return {
    error,
    isConnected,
    onSubmit,
  };
};
