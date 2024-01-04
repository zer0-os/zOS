import window from 'global/window';

export class FeatureFlags {
  _getBoolean(propName: string, defaultValue = false) {
    const savedValue = window.localStorage.getItem('FEATURE_FLAGS.' + propName);

    switch (savedValue) {
      case 'true':
        return true;
      case 'false':
        return false;
      default:
        return defaultValue;
    }
  }

  _setBoolean(propName: string, value: boolean) {
    window.localStorage.setItem('FEATURE_FLAGS.' + propName, value.toString());
  }

  get channelsApp() {
    return this._getBoolean('channelsApp');
  }

  set channelsApp(value: boolean) {
    this._setBoolean('channelsApp', value);
  }

  get allowPublicZOS() {
    return this._getBoolean('allowPublicZOS');
  }

  set allowPublicZOS(value: boolean) {
    this._setBoolean('allowPublicZOS', value);
  }

  get enableDevPanel() {
    return this._getBoolean('enableDevPanel');
  }

  set enableDevPanel(value: boolean) {
    this._setBoolean('enableDevPanel', value);
  }

  get resetPasswordPage() {
    return this._getBoolean('resetPasswordPage');
  }

  set resetPasswordPage(value: boolean) {
    this._setBoolean('resetPasswordPage', value);
  }

  get enableRewards() {
    return this._getBoolean('enableRewards');
  }

  set enableRewards(value: boolean) {
    this._setBoolean('enableRewards', value);
  }

  get enableMatrix() {
    return this._getBoolean('enableMatrix', true);
  }

  set enableMatrix(value: boolean) {
    this._setBoolean('enableMatrix', value);
  }

  get allowEmailLogin() {
    return this._getBoolean('allowEmailLogin', true);
  }

  set allowEmailLogin(value: boolean) {
    this._setBoolean('allowEmailLogin', value);
  }

  get internalUsage() {
    return this._getBoolean('internalUsage', false);
  }

  set internalUsage(value: boolean) {
    this._setBoolean('internalUsage', value);
  }
}

export const featureFlags = new FeatureFlags();

(window as any).FEATURE_FLAGS = featureFlags;
