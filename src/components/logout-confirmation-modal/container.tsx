import * as React from 'react';

import { connectContainer } from '../../store/redux-container';
import { RootState } from '../../store/reducer';
import { LogoutConfirmationModal } from '.';
import { closeLogoutModal, forceLogout } from '../../store/authentication';

export interface PublicProperties {}

export interface Properties extends PublicProperties {
  backupExists: boolean;
  backupRestored: boolean;

  closeLogoutModal: () => void;
  forceLogout: () => void;
}

export class Container extends React.Component<Properties> {
  static mapState(state: RootState): Partial<Properties> {
    const { backupExists, backupRestored } = state.matrix;

    return {
      backupExists,
      backupRestored,
    };
  }

  static mapActions(_props: Properties): Partial<Properties> {
    return { closeLogoutModal, forceLogout };
  }

  render() {
    return (
      <LogoutConfirmationModal
        backupExists={this.props.backupExists}
        backupRestored={this.props.backupRestored}
        onLogout={this.props.forceLogout}
        onClose={this.props.closeLogoutModal}
      />
    );
  }
}

export const LogoutConfirmationModalContainer = connectContainer<PublicProperties>(Container);
