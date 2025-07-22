import React from 'react';
import { Button, Variant as ButtonVariant, IconButton } from '@zero-tech/zui/components';
import { IconXClose } from '@zero-tech/zui/icons';

import styles from './styles.module.scss';

interface ZeroProNotificationProps {
  onUpgradeClick: () => void;
  onClose: () => void;
}

export const ZeroProNotification: React.FC<ZeroProNotificationProps> = ({ onUpgradeClick, onClose }) => {
  return (
    <div className={styles.NotificationContainer}>
      <Button className={styles.Notification} isSubmit onPress={onUpgradeClick} variant={ButtonVariant.Secondary}>
        Unlock Premium Features With Zero Pro
      </Button>
      <IconButton Icon={IconXClose} size={16} onClick={onClose} />
    </div>
  );
};
