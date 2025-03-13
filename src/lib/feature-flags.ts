import window from 'global/window';
import {
  getFeatureFlag,
  setFeatureFlag,
  FeatureFlagDefinitions,
  FeatureFlagKey,
  FeatureFlagValues,
} from './feature-flags/flags';
import { developmentFlags } from './feature-flags/development';
import { productionFlags } from './feature-flags/production';

export class FeatureFlags implements FeatureFlagValues {
  private config: FeatureFlagDefinitions;
  declare channelsApp: boolean;
  declare enableDevPanel: boolean;
  declare resetPasswordPage: boolean;
  declare enableRewards: boolean;
  declare enableMatrix: boolean;
  declare allowEmailRegistration: boolean;
  declare verboseLogging: boolean;
  declare allowEditPrimaryZID: boolean;
  declare enableReadReceiptPreferences: boolean;
  declare enableUserSettings: boolean;
  declare enableTimerLogs: boolean;
  declare enableChannels: boolean;
  declare enableCollapseableMenu: boolean;
  declare enableMeows: boolean;
  declare enableTokenGatedChat: boolean;
  declare enableNotificationsApp: boolean;
  declare enableNotificationsReadStatus: boolean;
  declare enableLoadMore: boolean;
  declare enableComments: boolean;
  declare enableFeedApp: boolean;
  declare enableLinkedAccounts: boolean;
  declare enableZeroWalletSigning: boolean;
  declare enableFeedChat: boolean;

  constructor() {
    this.config = process.env.NODE_ENV === 'production' ? productionFlags : developmentFlags;
    this.initializeAccessors();
  }

  private _getBoolean(propName: FeatureFlagKey, defaultValue = false): boolean {
    return getFeatureFlag(propName, this.config[propName] ?? { defaultValue });
  }

  private _setBoolean(propName: FeatureFlagKey, value: boolean): void {
    setFeatureFlag(propName, value, this.config[propName]);
  }

  private initializeAccessors() {
    Object.keys(this.config).forEach((key) => {
      const flagKey = key as FeatureFlagKey;
      Object.defineProperty(this, flagKey, {
        get: () => this._getBoolean(flagKey, this.config[flagKey].defaultValue),
        set: (value: boolean) => this._setBoolean(flagKey, value),
        enumerable: true,
        configurable: true,
      });
    });
  }

  public reset(): void {
    Object.keys(this.config).forEach((key) => {
      const flagKey = key as FeatureFlagKey;
      const defaultValue = this.config[flagKey].defaultValue;
      this._setBoolean(flagKey, defaultValue);
    });
  }
}

export const featureFlags = new FeatureFlags();
(window as any).FEATURE_FLAGS = featureFlags;
