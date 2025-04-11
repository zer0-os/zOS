import { useSelector } from 'react-redux';
import {
  primaryZIDSelector,
  userFirstNameSelector,
  userProfileImageSelector,
} from '../../../../store/authentication/selectors';

import { Panel, PanelBody } from '../../../../components/layout/panel';
import { MatrixAvatar } from '../../../../components/matrix-avatar';
import { IconLogoZero } from '@zero-tech/zui/icons';
import MatrixMask from './matrix-mask.svg?react';

import styles from './styles.module.scss';

export const UserPanel = () => {
  const { handle, profileImageUrl, zid } = useUserPanel();

  return (
    <Panel className={styles.Container}>
      <PanelBody className={styles.Body}>
        <div>
          <IconLogoZero size={18} />
          <div className={styles.Header}>
            <MatrixAvatar className={styles.Avatar} imageURL={profileImageUrl} size='regular' />
            <MatrixMask className={styles.Mask} />
          </div>
          <div className={styles.Name}>
            <h1>{handle}</h1>
            <h2>{zid}</h2>
          </div>
        </div>
      </PanelBody>
    </Panel>
  );
};

const useUserPanel = () => {
  const handle = useSelector(userFirstNameSelector);
  const profileImageUrl = useSelector(userProfileImageSelector);
  const zid = useSelector(primaryZIDSelector);

  return {
    handle,
    profileImageUrl,
    zid,
  };
};
