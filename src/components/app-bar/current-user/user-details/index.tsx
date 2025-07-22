import React from 'react';
import { Button, Variant as ButtonVariant } from '@zero-tech/zui/components';

import styles from './styles.module.scss';

interface UserDetailsProps {
  userName: string;
  userHandle: string;
  isHandleAWalletAddress: boolean;
  onOpenVerifyIdDialog: () => void;
}

export const UserDetails: React.FC<UserDetailsProps> = ({
  userName,
  userHandle,
  isHandleAWalletAddress,
  onOpenVerifyIdDialog,
}) => {
  return (
    <>
      <div className={styles.Name}>{userName}</div>
      {isHandleAWalletAddress ? (
        <Button className={styles.Verify} isSubmit onPress={onOpenVerifyIdDialog} variant={ButtonVariant.Secondary}>
          <div>Verify ID</div>
        </Button>
      ) : (
        <div className={styles.Handle}>{userHandle}</div>
      )}
    </>
  );
};
