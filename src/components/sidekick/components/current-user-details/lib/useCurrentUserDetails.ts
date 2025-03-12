import { RootState } from '../../../../../store/reducer';
import { openUserProfile } from '../../../../../store/user-profile';
import { totalRewardsViewed } from '../../../../../store/rewards';

import { useDispatch, useSelector } from 'react-redux';
import { useState } from 'react';

export const useCurrentUserDetails = () => {
  const dispatch = useDispatch();

  const rewards = useSelector((state: RootState) => ({
    showNewRewardsIndicator: state.rewards.showNewRewardsIndicator,
    showRewardsInTooltip: state.rewards.showRewardsInTooltip,
  }));

  const user = useSelector((state: RootState) => ({
    primaryZID: state.authentication.user?.data?.primaryZID,
    firstName: state.authentication.user?.data?.profileSummary?.firstName,
    profileImage: state.authentication.user?.data?.profileSummary?.profileImage,
  }));

  const [isVerifyIdDialogOpen, setIsVerifyIdDialogOpen] = useState(false);

  const handleOnOpenVerifyIdDialog = () => {
    setIsVerifyIdDialogOpen(true);
  };

  const handleOnCloseVerifyIdDialog = () => {
    setIsVerifyIdDialogOpen(false);
  };

  const handleOnOpenUserProfile = () => {
    dispatch(openUserProfile());
  };

  return {
    hasUnviewedRewards: rewards.showNewRewardsIndicator,
    isVerifyIdDialogOpen,
    onCloseVerifyIdDialog: handleOnCloseVerifyIdDialog,
    onOpenVerifyIdDialog: handleOnOpenVerifyIdDialog,
    onOpenUserProfile: handleOnOpenUserProfile,
    showRewardsTooltip: rewards.showRewardsInTooltip,
    totalRewardsViewed: () => dispatch(totalRewardsViewed()),
    userAvatarUrl: user.profileImage || '',
    userHandle: user.primaryZID || '',
    userName: user.firstName || '',
  };
};
