import window from 'global/window';

export class FeatureFlags {
  _getBoolean(propName: string) {
    return window.localStorage.getItem('FEATURE_FLAGS.' + propName) === 'true';
  }

  _setBoolean(propName: string, value: boolean) {
    window.localStorage.setItem('FEATURE_FLAGS.' + propName, value.toString());
  }

  // XXX - example
  //
  // get exampleFeatureFlag() {
  //   return this._getBoolean('exampleFeatureFlag');
  // }

  // set exampleFeatureFlag(value: boolean) {
  //   this._setBoolean('exampleFeatureFlag', value);
  // }
}

export const featureFlags = new FeatureFlags();

(window as any).FEATURE_FLAGS = featureFlags;
