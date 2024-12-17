import * as React from 'react';

import { Color, Modal, Variant } from '../modal';

export interface Properties {
  onLogout: () => void;
}

export class AccountLockedDialog extends React.Component<Properties> {
  render() {
    return (
      <Modal
        title='Account Locked'
        primaryText='Close and Log Out'
        primaryVariant={Variant.Primary}
        primaryColor={Color.Red}
        onPrimary={this.props.onLogout}
        onClose={this.props.onLogout}
      >
        <div>
          <p>Your account is locked. Please contact support.</p>
          <p>Closing this modal will redirect you to the login page.</p>
        </div>
      </Modal>
    );
  }
}
