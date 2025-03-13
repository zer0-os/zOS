import { store } from '../../store';
import { currentUserSelector } from '../../store/authentication/saga';

export type FeatureFlagKey =
  | 'channelsApp'
  | 'enableDevPanel'
  | 'resetPasswordPage'
  | 'enableRewards'
  | 'enableMatrix'
  | 'allowEmailRegistration'
  | 'verboseLogging'
  | 'allowEditPrimaryZID'
  | 'enableReadReceiptPreferences'
  | 'enableUserSettings'
  | 'enableTimerLogs'
  | 'enableChannels'
  | 'enableCollapseableMenu'
  | 'enableMeows'
  | 'enableTokenGatedChat'
  | 'enableNotificationsApp'
  | 'enableNotificationsReadStatus'
  | 'enableLoadMore'
  | 'enableComments'
  | 'enableFeedApp'
  | 'enableLinkedAccounts'
  | 'enableZeroWalletSigning'
  | 'enableFeedChat';

export interface FeatureFlagConfig {
  defaultValue: boolean;
  locked?: boolean;
  allowedUserIds?: string[];
}

export type FeatureFlagDefinitions = Record<FeatureFlagKey, FeatureFlagConfig>;

export type FeatureFlagValues = Record<FeatureFlagKey, boolean>;

export const getFeatureFlag = (propName: FeatureFlagKey, config?: FeatureFlagConfig): boolean => {
  const savedValue = window.localStorage.getItem('FEATURE_FLAGS.' + propName);

  // If the config has allowedUserIds, treat it as a locked feature that's only enabled for specific users
  if (config?.allowedUserIds) {
    const state = store.getState();
    const userId = currentUserSelector()(state)?.id;
    if (userId && config.allowedUserIds.includes(userId)) {
      return true;
    }
    return false;
  }

  // If the value exists in localStorage, use it unless the flag is locked
  if (savedValue !== null) {
    const boolValue = savedValue === 'true';
    // If config exists and is locked, ensure we're using the default value
    if (config?.locked) {
      return config.defaultValue;
    }
    return boolValue;
  }

  // If no saved value, return the default value from config or false
  return config?.defaultValue ?? false;
};

export const setFeatureFlag = (propName: FeatureFlagKey, value: boolean, config?: FeatureFlagConfig): boolean => {
  // If the flag is locked or has allowedUserIds, prevent modification
  if (config?.locked || config?.allowedUserIds) {
    console.warn('Feature flag is locked');
    return false;
  }

  window.localStorage.setItem('FEATURE_FLAGS.' + propName, value.toString());
  return true;
};
