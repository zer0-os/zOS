import { FeatureFlagDefinitions } from './flags';

export const productionFlags: FeatureFlagDefinitions = {
  channelsApp: { defaultValue: false },
  enableDevPanel: { defaultValue: false },
  resetPasswordPage: { defaultValue: false },
  verboseLogging: { defaultValue: false },
  enableReadReceiptPreferences: { defaultValue: false },
  enableTimerLogs: { defaultValue: false },
  enableNotificationsReadStatus: { defaultValue: false },
  enableAuraZApp: {
    defaultValue: false,
    locked: true,
  },
  enableMatrixDebug: { defaultValue: false },
  enableCreateTGCChannel: { defaultValue: false },
  enableStaking: { defaultValue: true },
  enableUnstaking: { defaultValue: true },
};
