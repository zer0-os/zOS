import { useLoadMore } from './useLoadMore';
import { Badge } from '@zero-tech/zui/components';

import styles from './index.module.scss';

export interface LoadMoreButtonProps {
  channelId: string;
}

export const LoadMoreButton = ({ channelId }: LoadMoreButtonProps) => {
  const { count, hasMore, handleLoadMore } = useLoadMore(channelId);

  if (!hasMore) {
    return null;
  }

  return (
    <button className={styles.Button} onClick={handleLoadMore}>
      Show more posts <Badge content={count} variant='active' type='number' />
    </button>
  );
};
