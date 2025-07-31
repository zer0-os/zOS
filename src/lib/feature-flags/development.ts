import { FeatureFlagDefinitions } from './flags';

export const developmentFlags: FeatureFlagDefinitions = {
  channelsApp: { defaultValue: false },
  enableDevPanel: { defaultValue: false },
  resetPasswordPage: { defaultValue: false },
  verboseLogging: { defaultValue: false },
  enableReadReceiptPreferences: { defaultValue: false },
  enableTimerLogs: { defaultValue: false },
  enableNotificationsReadStatus: { defaultValue: false },
  enableAuraZApp: {
    defaultValue: false,
    allowedUserIds: ['50c6e12e-1fe2-43f9-8991-ab269696588f', '020705c6-0740-4d4d-8185-0ba7542b9725'],
  },
  enableMatrixDebug: { defaultValue: true },
  enableCreateTGCChannel: { defaultValue: true },
  enableStaking: { defaultValue: true },
};
