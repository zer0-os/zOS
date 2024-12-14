import { useDispatch } from 'react-redux';
import { SagaActionTypes } from '../../../../store/posts';

export const useMeowPost = () => {
  const dispatch = useDispatch();

  const meowPost = (postId: string, meowAmount: string) => {
    dispatch({ type: SagaActionTypes.MeowPost, payload: { postId, meowAmount } });
  };

  return {
    meowPost,
  };
};
