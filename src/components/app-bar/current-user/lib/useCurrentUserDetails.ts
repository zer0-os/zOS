import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { RootState } from '../../../../store/reducer';
import { totalRewardsViewed } from '../../../../store/rewards';
import { openUserProfile, closeUserProfile, Stage } from '../../../../store/user-profile';
import { userProfileStageSelector } from '../../../../store/user-profile/selectors';
import {
  primaryZIDSelector,
  userFirstNameSelector,
  userProfileImageSelector,
} from '../../../../store/authentication/selectors';

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

const rewardsTooltipSelector = (state: RootState) => ({
  showNewRewardsIndicator: state.rewards.showNewRewardsIndicator,
  showRewardsInTooltip: state.rewards.showRewardsInTooltip,
});

export const useCurrentUserDetails = (): CurrentUserDetailsReturn => {
  const dispatch = useDispatch();

  const rewards = useSelector(rewardsTooltipSelector);
  const primaryZID = useSelector(primaryZIDSelector);
  const firstName = useSelector(userFirstNameSelector);
  const profileImage = useSelector(userProfileImageSelector);
  const userProfileStage = useSelector(userProfileStageSelector);

  const [isVerifyIdDialogOpen, setIsVerifyIdDialogOpen] = useState(false);

  const handleOnClick = () => {
    if (userProfileStage === Stage.None) {
      dispatch(openUserProfile());
    } else {
      dispatch(closeUserProfile());
    }
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
    isHandleAWalletAddress: primaryZID?.startsWith('0x'),
    onClick: handleOnClick,
    onCloseVerifyIdDialog: handleOnCloseVerifyIdDialog,
    onOpenVerifyIdDialog: handleOnOpenVerifyIdDialog,
    userAvatarUrl: profileImage || '',
    userHandle: primaryZID || '',
    userName: firstName || '',
  };
};
