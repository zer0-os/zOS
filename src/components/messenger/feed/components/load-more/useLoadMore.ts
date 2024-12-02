import { useDispatch } from 'react-redux';
import { refetchPosts } from '../../../../../store/posts';

export const useLoadMore = (channelId: string) => {
  const dispatch = useDispatch();

  const count = 10;

  const handleLoadMore = () => {
    dispatch(refetchPosts({ channelId }));
  };

  return {
    hasMore: count > 0,
    count,
    handleLoadMore,
  };
};
