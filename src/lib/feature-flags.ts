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
    return this._getBoolean('enableRewards', true);
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

  get allowEmailRegistration() {
    return this._getBoolean('allowEmailRegistration', true);
  }

  set allowEmailRegistration(value: boolean) {
    this._setBoolean('allowEmailRegistration', value);
  }

  get verboseLogging() {
    return this._getBoolean('verboseLogging', true);
  }

  set verboseLogging(value: boolean) {
    this._setBoolean('verboseLogging', value);
  }

  get allowEditPrimaryZID() {
    return this._getBoolean('allowEditPrimaryZID', true);
  }

  set allowEditPrimaryZID(value: boolean) {
    this._setBoolean('allowEditPrimaryZID', value);
  }

  get enableReadReceiptPreferences() {
    return this._getBoolean('enableReadReceiptPreferences', false);
  }

  set enableReadReceiptPreferences(value: boolean) {
    this._setBoolean('enableReadReceiptPreferences', value);
  }

  get enableUserSettings() {
    return this._getBoolean('enableUserSettings', true);
  }

  set enableUserSettings(value: boolean) {
    this._setBoolean('enableUserSettings', value);
  }

  get enableTimerLogs() {
    return this._getBoolean('enableTimerLogs', false);
  }

  set enableTimerLogs(value: boolean) {
    this._setBoolean('enableTimerLogs', value);
  }

  get enableChannels() {
    return this._getBoolean('enableChannels', true);
  }

  set enableChannels(value: boolean) {
    this._setBoolean('enableChannels', value);
  }

  get enableCollapseableMenu() {
    return this._getBoolean('enableCollapseableMenu', true);
  }

  set enableCollapseableMenu(value: boolean) {
    this._setBoolean('enableCollapseableMenu', value);
  }

  get enableMeows() {
    return this._getBoolean('enableMeows', false);
  }

  set enableMeows(value: boolean) {
    this._setBoolean('enableMeows', value);
  }

  get postImageMessagesToMatrix() {
    return this._getBoolean('postImagesToMatrix', true);
  }

  set postImageMessagesToMatrix(value: boolean) {
    this._setBoolean('postImagesToMatrix', value);
  }
}

export const featureFlags = new FeatureFlags();

(window as any).FEATURE_FLAGS = featureFlags;
