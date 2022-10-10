import React from 'react';

import { Button as ComponentButton } from '@zer0-os/zos-component-library';

export interface Properties {
  setWalletModalOpen: (status: boolean) => void;
}

export class Button extends React.Component<Properties> {
  openModal = () => {
    this.props.setWalletModalOpen(true);
  };

  render() {
    return (
      <div onClick={this.openModal}>
        <ComponentButton>Connect</ComponentButton>
      </div>
    );
  }
}
