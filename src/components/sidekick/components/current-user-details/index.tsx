import { useCurrentUserDetails } from './lib/useCurrentUserDetails';

import { Modal } from '@zero-tech/zui/components/Modal';
import { UserHeader as UserHeaderComponent } from './components/user-header';
import { VerifyIdDialog } from '../../../verify-id-dialog';

export const CurrentUserDetails = () => {
  const {
    hasUnviewedRewards,
    isVerifyIdDialogOpen,
    onCloseVerifyIdDialog,
    onOpenVerifyIdDialog,
    onOpenUserProfile,
    showRewardsTooltip,
    totalRewardsViewed,
    userAvatarUrl,
    userHandle,
    userName,
  } = useCurrentUserDetails();

  return (
    <>
      <UserHeaderComponent
        hasUnviewedRewards={hasUnviewedRewards}
        onVerifyId={onOpenVerifyIdDialog}
        openUserProfile={onOpenUserProfile}
        showRewardsTooltip={showRewardsTooltip}
        totalRewardsViewed={totalRewardsViewed}
        userAvatarUrl={userAvatarUrl}
        userHandle={userHandle}
        userName={userName}
      />

      {/* This modal is only ever triggered by this component, so it makes sense to be here */}
      {isVerifyIdDialogOpen && (
        <Modal open={isVerifyIdDialogOpen} onOpenChange={onCloseVerifyIdDialog}>
          <VerifyIdDialog onClose={onCloseVerifyIdDialog} />
        </Modal>
      )}
    </>
  );
};
