import { useLoadMore } from './useLoadMore';

import styles from './index.module.scss';
import { Badge } from '@zero-tech/zui/components';

export const LoadMoreButton = () => {
  const { count, hasMore } = useLoadMore();

  if (!hasMore) {
    return null;
  }

  return (
    <button className={styles.Button} onClick={() => console.log('click')}>
      Show more posts <Badge content={count} variant='active' type='number' />
    </button>
  );
};
