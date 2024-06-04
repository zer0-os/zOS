import * as React from 'react';

import { RootState } from '../../../../store/reducer';
import { connectContainer } from '../../../../store/redux-container';
import { MainBackground, setMainBackground } from '../../../../store/background';
import { privateReadReceipts, publicReadReceipts } from '../../../../store/user-profile';

import { SettingsPanel } from '.';

export interface PublicProperties {
  onClose?: () => void;
}

export interface Properties extends PublicProperties {
  selectedMainBackground: MainBackground;
  isPublicReadReceipts: boolean;

  setMainBackground: (payload: { selectedBackground: MainBackground }) => void;
  privateReadReceipts: () => void;
  publicReadReceipts: () => void;
}

export class Container extends React.Component<Properties> {
  static mapState(state: RootState) {
    const { background, userProfile } = state;
    return {
      selectedMainBackground: background.selectedMainBackground,
      isPublicReadReceipts: userProfile.isPublicReadReceipts,
    };
  }

  static mapActions(_props: Properties): Partial<Properties> {
    return { setMainBackground, privateReadReceipts, publicReadReceipts };
  }

  render() {
    return (
      <SettingsPanel
        selectedMainBackground={this.props.selectedMainBackground}
        isPublicReadReceipts={this.props.isPublicReadReceipts}
        onBack={this.props.onClose}
        onSetMainBackground={this.props.setMainBackground}
        onPrivateReadReceipts={this.props.privateReadReceipts}
        onPublicReadReceipts={this.props.publicReadReceipts}
      />
    );
  }
}

export const SettingsPanelContainer = connectContainer<PublicProperties>(Container);
