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
    allowedUserIds: [
      'dca9d449-548b-4fc9-8411-aab7b48bffc0',
      'f977959f-08db-4e09-b730-b5d7a6577481',
      'bcdcdf9b-e278-43c5-ac34-07a21689ab01',
      'a8df265e-5e4c-46e9-a6e5-9da8684f96ac',
    ],
  },
  enableMatrixDebug: { defaultValue: false },
  enableCreateTGCChannel: { defaultValue: true },
  enableStaking: { defaultValue: true },
};
