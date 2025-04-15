import { UserPanel } from './panels/UserPanel';
import { Switcher } from './panels/Switcher';

import styles from './styles.module.scss';

export const ProfileApp = () => {
  return (
    <div className={styles.Wrapper}>
      <Switcher />
      <div>
        <UserPanel />
      </div>
    </div>
  );
};
