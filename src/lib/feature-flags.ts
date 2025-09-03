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
  declare verboseLogging: boolean;
  declare enableReadReceiptPreferences: boolean;
  declare enableTimerLogs: boolean;
  declare enableNotificationsReadStatus: boolean;
  declare enableAuraZApp: boolean;
  declare enableTokenZApp: boolean;
  declare enableMatrixDebug: boolean;
  declare enableCreateTGCChannel: boolean;
  declare enableStaking: boolean;
  declare enableUnstaking: boolean;
  declare enableAvaxStaking: boolean;

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
      localStorage.removeItem(`FEATURE_FLAGS.${flagKey}`);
    });
  }
}
export const featureFlags = new FeatureFlags();
(window as any).FEATURE_FLAGS = featureFlags;
