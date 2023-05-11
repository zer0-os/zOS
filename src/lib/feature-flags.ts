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

  get allowInvites() {
    return this._getBoolean('allowInvites');
  }

  set allowInvites(value: boolean) {
    this._setBoolean('allowInvites', value);
  }

  get fullScreenMessenger() {
    return this._getBoolean('fullScreenMessenger');
  }

  set fullScreenMessenger(value: boolean) {
    this._setBoolean('fullScreenMessenger', value);
  }
}

export const featureFlags = new FeatureFlags();

(window as any).FEATURE_FLAGS = featureFlags;
