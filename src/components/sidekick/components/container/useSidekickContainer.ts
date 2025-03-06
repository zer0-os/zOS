import { useSelector } from 'react-redux';
import { RootState } from '../../../../store';
import { Stage } from '../../../../store/user-profile';

export interface UseSideKickContainerReturn {
  /**
   * Whether or not the settings panel is open.
   * This is the panel containing "Invite Friends", "Edit Profile", etc.
   */
  isSettingsOpen: boolean;
}

export const useSidekickContainer = (variant?: 'primary' | 'secondary'): UseSideKickContainerReturn => {
  const userProfileStage = useSelector((state: RootState) => state.userProfile.stage);

  return {
    isSettingsOpen: variant === 'primary' && userProfileStage !== Stage.None,
  };
};
