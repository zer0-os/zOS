import { useDispatch, useSelector } from 'react-redux';
import { refetchPosts } from '../../../../store/posts';
import { RootState } from '../../../../store';

export const useLoadMore = (channelId: string) => {
  const dispatch = useDispatch();
  const difference = useSelector(
    (state: RootState) => (state.posts.count ?? state.posts.initialCount ?? 0) - (state.posts.initialCount ?? 0)
  );

  const handleLoadMore = () => {
    dispatch(refetchPosts({ channelId }));
  };

  return {
    hasMore: difference > 0,
    count: difference,
    handleLoadMore,
  };
};
