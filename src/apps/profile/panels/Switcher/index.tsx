import { useProfileApp } from '../../lib/useProfileApp';

import { Feed } from '../../../feed/components/feed';

import styles from './styles.module.scss';

export const Switcher = () => {
  const { userId } = useSwitcher();

  return (
    <div className={styles.Container}>
      <div className={styles.Content}>
        <Feed isPostingEnabled={false} userId={userId} />
      </div>
    </div>
  );
};

const useSwitcher = () => {
  const { data } = useProfileApp();

  return {
    userId: data?.userId,
  };
};
