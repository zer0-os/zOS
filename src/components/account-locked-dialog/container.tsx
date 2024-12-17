import * as React from 'react';

import { connectContainer } from '../../store/redux-container';
import { RootState } from '../../store/reducer';
import { AccountLockedDialog } from '.';
import { forceLogout } from '../../store/authentication';

export interface PublicProperties {}

export interface Properties extends PublicProperties {
  forceLogout: () => void;
}

export class Container extends React.Component<Properties> {
  static mapState(_state: RootState): Partial<Properties> {
    return {};
  }

  static mapActions(_props: Properties): Partial<Properties> {
    return { forceLogout };
  }

  render() {
    return <AccountLockedDialog onLogout={this.props.forceLogout} />;
  }
}

export const AccountLockedDialogContainer = connectContainer<PublicProperties>(Container);
