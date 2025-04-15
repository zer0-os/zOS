import { useDispatch, useSelector } from 'react-redux';
import { refetchPosts } from '../../../../store/posts';
import { RootState } from '../../../../store';

const postDifferenceSelector = (state: RootState) => {
  return (state.posts.count ?? state.posts.initialCount ?? 0) - (state.posts.initialCount ?? 0);
};

export const useLoadMore = (channelId: string) => {
  const dispatch = useDispatch();
  const difference = useSelector(postDifferenceSelector);

  const handleLoadMore = () => {
    dispatch(refetchPosts({ channelId }));
  };

  return {
    hasMore: difference > 0,
    count: difference,
    handleLoadMore,
  };
};
