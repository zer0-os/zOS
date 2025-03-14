import { FeatureFlagDefinitions } from './flags';

export const developmentFlags: FeatureFlagDefinitions = {
  channelsApp: { defaultValue: false },
  enableDevPanel: { defaultValue: false },
  resetPasswordPage: { defaultValue: false },
  enableRewards: { defaultValue: true },
  enableMatrix: { defaultValue: true },
  allowEmailRegistration: { defaultValue: true },
  verboseLogging: { defaultValue: false },
  allowEditPrimaryZID: { defaultValue: true },
  enableReadReceiptPreferences: { defaultValue: false },
  enableUserSettings: { defaultValue: true },
  enableTimerLogs: { defaultValue: false },
  enableChannels: { defaultValue: true },
  enableCollapseableMenu: { defaultValue: true },
  enableMeows: { defaultValue: true },
  enableTokenGatedChat: { defaultValue: true },
  enableNotificationsApp: { defaultValue: true },
  enableNotificationsReadStatus: { defaultValue: false },
  enableLoadMore: { defaultValue: true },
  enableComments: { defaultValue: true },
  enableFeedApp: { defaultValue: true },
  enableLinkedAccounts: { defaultValue: true },
  enableZeroWalletSigning: { defaultValue: true },
  enableFeedChat: { defaultValue: true },
  enableAuraZApp: {
    defaultValue: false,
    allowedUserIds: ['50c6e12e-1fe2-43f9-8991-ab269696588f', '020705c6-0740-4d4d-8185-0ba7542b9725'],
  },
};
