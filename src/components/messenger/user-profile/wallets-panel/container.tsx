import * as React from 'react';

import { RootState } from '../../../../store/reducer';
import { connectContainer } from '../../../../store/redux-container';

import { WalletsPanel } from './index';

export interface PublicProperties {
  onClose?: () => void;
}

export interface Properties extends PublicProperties {}

export class Container extends React.Component<Properties> {
  static mapState(_state: RootState) {
    return {};
  }

  static mapActions(_props: Properties): Partial<Properties> {
    return {};
  }

  render() {
    return <WalletsPanel onBack={this.props.onClose} />;
  }
}

export const WalletsPanelContainer = connectContainer<PublicProperties>(Container);
