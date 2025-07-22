import { useCurrentUserDetails } from './lib/useCurrentUserDetails';
import { useZeroProNotification } from './lib/useZeroProNotification';

import { Modal } from '@zero-tech/zui/components/Modal';
import { RewardsToolTipContainer } from '../../messenger/list/rewards-tooltip/container';
import { VerifyIdDialog } from '../../verify-id-dialog';
import { ZeroProNotification } from './zero-pro-notification';
import { UserDetails } from './user-details';

import styles from './styles.module.scss';
import { MatrixAvatar } from '../../matrix-avatar';

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

  const { showZeroProNotification, onUpgradeClick, onCloseZeroProNotification } = useZeroProNotification();

  return (
    <>
      <div className={styles.Wrapper}>
        <div
          className={`${styles.Container} ${showZeroProNotification ? styles.ShowNotification : ''}`}
          onClick={onClick}
        >
          <MatrixAvatar imageURL={userAvatarUrl} isActive={hasUnviewedRewards} size={'medium'} statusType={'active'} />
          <div className={styles.Drawer}>
            <div className={styles.Details}>
              {showZeroProNotification ? (
                <ZeroProNotification onUpgradeClick={onUpgradeClick} onClose={onCloseZeroProNotification} />
              ) : (
                <UserDetails
                  userName={userName}
                  userHandle={userHandle}
                  isHandleAWalletAddress={isHandleAWalletAddress}
                  onOpenVerifyIdDialog={onOpenVerifyIdDialog}
                />
              )}
            </div>
          </div>
          {isRewardsTooltipOpen && <RewardsToolTipContainer />}
        </div>
      </div>

      {isVerifyIdDialogOpen && (
        <Modal onOpenChange={onCloseVerifyIdDialog} open={isVerifyIdDialogOpen}>
          <VerifyIdDialog onClose={onCloseVerifyIdDialog} />
        </Modal>
      )}
    </>
  );
};
