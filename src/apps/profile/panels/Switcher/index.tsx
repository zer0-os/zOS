import { useProfileApp } from '../../lib/useProfileApp';

import { Feed } from '../../../feed/components/feed';

import styles from './styles.module.scss';

export const Switcher = () => {
  const { userId, isLoading } = useSwitcher();

  return (
    <div className={styles.Container}>
      <div className={styles.Content}>
        <Feed isPostingEnabled={false} userId={userId} isLoading={isLoading} />
      </div>
    </div>
  );
};

const useSwitcher = () => {
  const { data, isLoading } = useProfileApp();

  return {
    userId: data?.userId,
    isLoading,
  };
};
