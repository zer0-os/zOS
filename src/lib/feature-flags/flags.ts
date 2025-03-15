import window from 'global/window';

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
  | 'enableFeedChat'
  | 'enableAuraZApp';

export interface FeatureFlagConfig {
  defaultValue: boolean;
  locked?: boolean;
  allowedUserIds?: string[];
}

export type FeatureFlagDefinitions = Record<FeatureFlagKey, FeatureFlagConfig>;

export type FeatureFlagValues = Record<FeatureFlagKey, boolean>;

/**
 * Bypass the store dependency for the current user ID if we're in a test environment.
 */
let getCurrentUserId = () => null;
export const setGetCurrentUserId = (fn: () => string | null) => {
  getCurrentUserId = fn;
};
if (process.env.NODE_ENV !== 'test') {
  (async () => {
    const { store } = await import('../../store');
    getCurrentUserId = () => store.getState().authentication?.user?.data?.id ?? null;
  })();
}

export const getFeatureFlag = (propName: FeatureFlagKey, config?: FeatureFlagConfig): boolean => {
  const savedValue = window.localStorage.getItem('FEATURE_FLAGS.' + propName);

  // If the config has allowedUserIds, treat it as a locked feature that's only enabled for specific users
  if (config?.allowedUserIds) {
    const userId = getCurrentUserId();
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
