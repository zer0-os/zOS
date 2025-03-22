import { useCurrentUserDetails } from './lib/useCurrentUserDetails';

import { Avatar } from '@zero-tech/zui/components/Avatar';
import { Button, Variant as ButtonVariant } from '@zero-tech/zui/components/Button';
import { Modal } from '@zero-tech/zui/components/Modal';
import { RewardsToolTipContainer } from '../../messenger/list/rewards-tooltip/container';
import { VerifyIdDialog } from '../../verify-id-dialog';

import styles from './styles.module.scss';

export const CurrentUser = () => {
  const {
    hasUnviewedRewards,
    isHandleAWalletAddress,
    isRewardsTooltipOpen,
    isVerifyIdDialogOpen,
    onClick,
    onCloseVerifyIdDialog,
    onOpenVerifyIdDialog,
    userAvatarUrl,
    userHandle,
    userName,
  } = useCurrentUserDetails();

  return (
    <>
      <div className={styles.Container} onClick={onClick}>
        <Avatar imageURL={userAvatarUrl} isActive={hasUnviewedRewards} size={'medium'} statusType={'active'} />
        <div className={styles.Drawer}>
          <div className={styles.Details}>
            <div className={styles.Name}>{userName}</div>
            {isHandleAWalletAddress ? (
              <Button
                className={styles.Verify}
                isSubmit
                onPress={onOpenVerifyIdDialog}
                variant={ButtonVariant.Secondary}
              >
                <div>Verify ID</div>
              </Button>
            ) : (
              <div className={styles.Handle}>{userHandle}</div>
            )}
          </div>
        </div>
        {isRewardsTooltipOpen && <RewardsToolTipContainer />}
      </div>

      {isVerifyIdDialogOpen && (
        <Modal onOpenChange={onCloseVerifyIdDialog} open={isVerifyIdDialogOpen}>
          <VerifyIdDialog onClose={onCloseVerifyIdDialog} />
        </Modal>
      )}
    </>
  );
};
