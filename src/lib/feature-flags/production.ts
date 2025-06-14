import { FeatureFlagDefinitions } from './flags';

export const productionFlags: FeatureFlagDefinitions = {
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
    allowedUserIds: [
      'dca9d449-548b-4fc9-8411-aab7b48bffc0',
      'f977959f-08db-4e09-b730-b5d7a6577481',
      'bcdcdf9b-e278-43c5-ac34-07a21689ab01',
      'a8df265e-5e4c-46e9-a6e5-9da8684f96ac',
    ],
  },
  enableProfile: { defaultValue: true },
  enableUserProfiles: { defaultValue: true },
  enablePostMedia: { defaultValue: true },
  enableMatrixDebug: { defaultValue: false },
  enableProfileDirectMessage: { defaultValue: true },
  enableOAuthLinking: {
    defaultValue: false,
    allowedUserIds: [
      'dca9d449-548b-4fc9-8411-aab7b48bffc0',
      'f2928be2-0f82-47d1-bbbd-46148c1f173b',
      'f977959f-08db-4e09-b730-b5d7a6577481',
      '3b32cdd4-3a6e-4e5d-863c-a332615c11fc',
      '92c85c98-1c05-400b-98ab-68d8298861af',
      '0ddf68b2-711b-4775-89a9-0a38b1a8a6e6',
      'bcdcdf9b-e278-43c5-ac34-07a21689ab01',
      '2458fd9f-1a02-4c97-8166-a717cee8b51c',
      '2791334a-f48a-4aa3-88bf-26933c206d2f',
      '93ee6c6e-cf5a-44ea-9f27-7f29c3cc221d',
      '8bed44f1-7886-4607-ad33-0279c077ee41',
    ],
  },
};
