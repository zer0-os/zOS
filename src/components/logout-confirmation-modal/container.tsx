import * as React from 'react';

import { connectContainer } from '../../store/redux-container';
import { RootState } from '../../store/reducer';
import { LogoutConfirmationModal } from '.';
import { closeLogoutModal, forceLogout } from '../../store/authentication';

export interface PublicProperties {}

export interface Properties extends PublicProperties {
  backupExists: boolean;
  backupVerified: boolean;

  closeLogoutModal: () => void;
  forceLogout: () => void;
}

export class Container extends React.Component<Properties> {
  static mapState(state: RootState): Partial<Properties> {
    const { trustInfo } = state.matrix;

    return {
      backupExists: !!trustInfo,
      backupVerified: Boolean(trustInfo?.usable || trustInfo?.trustedLocally),
    };
  }

  static mapActions(_props: Properties): Partial<Properties> {
    return { closeLogoutModal, forceLogout };
  }

  render() {
    return (
      <LogoutConfirmationModal
        backupExists={this.props.backupExists}
        backupVerified={this.props.backupVerified}
        onLogout={this.props.forceLogout}
        onClose={this.props.closeLogoutModal}
      />
    );
  }
}

export const LogoutConfirmationModalContainer = connectContainer<PublicProperties>(Container);
