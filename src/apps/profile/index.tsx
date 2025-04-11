import { primaryZIDSelector } from '../../store/authentication/selectors';
import { useSelector } from 'react-redux';

import { Feed } from '../feed/components/feed';
import { UserPanel } from './panels/UserPanel';

import styles from './styles.module.scss';

export const ProfileApp = () => {
  const primaryZID = useSelector(primaryZIDSelector);
  const splitZID = primaryZID?.split('0://')[1];

  return (
    <div className={styles.Wrapper}>
      {splitZID && <Feed zid={splitZID} />}
      <div>
        <UserPanel />
      </div>
    </div>
  );
};
