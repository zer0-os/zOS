import window from 'global/window';

export class FeatureFlags {
  _getBoolean(propName: string) {
    return window.localStorage.getItem('FEATURE_FLAGS.' + propName) === 'true';
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

  get allowWeb3Registration() {
    return this._getBoolean('allowWeb3Registration');
  }

  set allowWeb3Registration(value: boolean) {
    this._setBoolean('allowWeb3Registration', value);
  }
}

export const featureFlags = new FeatureFlags();

(window as any).FEATURE_FLAGS = featureFlags;
