import { useProfileApp } from './lib/useProfileApp';

import { Feed } from '../feed/components/feed';
import { UserPanel } from './panels/UserPanel';

import styles from './styles.module.scss';

export const ProfileApp = () => {
  const { data } = useProfileApp();

  return (
    <div className={styles.Wrapper}>
      {data?.primaryZid && <Feed zid={data.primaryZid} />}
      <div>
        <UserPanel />
      </div>
    </div>
  );
};
