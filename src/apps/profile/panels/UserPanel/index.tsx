import { useUserPanel } from './useUserPanel';

import { Panel, PanelBody } from '../../../../components/layout/panel';
import { MatrixAvatar } from '../../../../components/matrix-avatar';
import { IconLogoZero } from '@zero-tech/zui/icons';
import MatrixMask from './matrix-mask.svg?react';

import { Skeleton } from '@zero-tech/zui/components/Skeleton';

import styles from './styles.module.scss';

export const UserPanel = () => {
  const { handle, profileImageUrl, zid, isLoading } = useUserPanel();

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
            <h1>{isLoading ? <Skeleton /> : handle}</h1>
            <h2>{isLoading ? <Skeleton /> : zid ? '0://' + zid : null}</h2>
          </div>
        </div>
      </PanelBody>
    </Panel>
  );
};
