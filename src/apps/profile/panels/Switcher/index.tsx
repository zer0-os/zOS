import { useProfileApp } from '../../lib/useProfileApp';

import { Feed } from '../../../feed/components/feed';

import styles from './styles.module.scss';

export const Switcher = () => {
  const { data } = useProfileApp();

  return (
    <div className={styles.Container}>
      <div className={styles.Content}>
        {data?.primaryZid && <Feed isPostingEnabled={false} zid={data.primaryZid} />}
      </div>
    </div>
  );
};
