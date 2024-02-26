import * as React from 'react';

import { connectContainer } from '../../store/redux-container';
import { RootState } from '../../store/reducer';
import { LogoutConfirmationModal } from '.';

export interface PublicProperties {}

export interface Properties extends PublicProperties {
  backupExists: boolean;
  backupVerified: boolean;

  action: () => void;
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
    return {
      action: () => null,
    };
  }

  render() {
    return <LogoutConfirmationModal backupExists={true} backupVerified={true} />;
  }
}

export const LogoutConfirmationModalContainer = connectContainer<PublicProperties>(Container);
