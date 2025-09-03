import { FeatureFlagDefinitions } from './flags';

export const developmentFlags: FeatureFlagDefinitions = {
  channelsApp: { defaultValue: false },
  enableDevPanel: { defaultValue: false },
  resetPasswordPage: { defaultValue: false },
  verboseLogging: { defaultValue: false },
  enableReadReceiptPreferences: { defaultValue: false },
  enableTimerLogs: { defaultValue: false },
  enableNotificationsReadStatus: { defaultValue: false },
  enableTokenZApp: { defaultValue: true },
  enableAuraZApp: { defaultValue: false },
  enableMatrixDebug: { defaultValue: true },
  enableCreateTGCChannel: { defaultValue: true },
  enableStaking: { defaultValue: true },
  enableUnstaking: { defaultValue: true },
  enableAvaxStaking: { defaultValue: true },
};
