import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { RootState } from '../../../../store/reducer';
import { totalRewardsViewed } from '../../../../store/rewards';
import { openUserProfile } from '../../../../store/user-profile';

export interface CurrentUserDetailsReturn {
  hasUnviewedRewards: boolean;
  isHandleAWalletAddress: boolean;
  isRewardsTooltipOpen: boolean;
  isVerifyIdDialogOpen: boolean;
  onClick: () => void;
  onCloseVerifyIdDialog: () => void;
  onOpenVerifyIdDialog: () => void;
  userAvatarUrl: string;
  userHandle: string;
  userName: string;
}

export const useCurrentUserDetails = (): CurrentUserDetailsReturn => {
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

  const handleOnClick = () => {
    dispatch(openUserProfile());
    dispatch(totalRewardsViewed());
  };

  const handleOnOpenVerifyIdDialog = () => {
    setIsVerifyIdDialogOpen(true);
  };

  const handleOnCloseVerifyIdDialog = () => {
    setIsVerifyIdDialogOpen(false);
  };

  return {
    hasUnviewedRewards: rewards.showNewRewardsIndicator,
    isRewardsTooltipOpen: rewards.showRewardsInTooltip,
    isVerifyIdDialogOpen,
    isHandleAWalletAddress: user.primaryZID?.startsWith('0x'),
    onClick: handleOnClick,
    onCloseVerifyIdDialog: handleOnCloseVerifyIdDialog,
    onOpenVerifyIdDialog: handleOnOpenVerifyIdDialog,
    userAvatarUrl: user.profileImage || '',
    userHandle: user.primaryZID || '',
    userName: user.firstName || '',
  };
};
