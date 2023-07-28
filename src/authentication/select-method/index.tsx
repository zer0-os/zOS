import * as React from 'react';

import { ToggleGroup } from '@zero-tech/zui/components';
import { CreateEmailAccountContainer } from '../create-email-account/container';
import { CreateWalletAccountContainer } from '../create-wallet-account/container';
import { bemClassName } from '../../lib/bem';

import './styles.scss';

const cn = bemClassName('select-method');

export interface Properties {}

export class SelectMethod extends React.PureComponent<Properties, { selectedMethod: string }> {
  constructor(props: Properties) {
    super(props);
    this.state = {
      selectedMethod: 'web3',
    };
  }

  handleSelectionChange = (selection: string) => {
    this.setState({ selectedMethod: selection });
  };

  renderAccountCreation() {
    const { selectedMethod } = this.state;

    switch (selectedMethod) {
      case 'email':
        return <CreateEmailAccountContainer />;
      case 'web3':
        return <CreateWalletAccountContainer />;
      default:
        return null;
    }
  }

  render() {
    const options = [
      { key: 'web3', label: 'Web3' },
      { key: 'email', label: 'Email' },
    ];

    return (
      <div {...cn()}>
        <h3 {...cn('heading')}>Create Account</h3>
        <ToggleGroup
          {...cn('toggle-group')}
          options={options}
          // variant deprecated but required
          variant='default'
          onSelectionChange={this.handleSelectionChange}
          selection={this.state.selectedMethod}
          selectionType='single'
          isRequired
        />

        {this.renderAccountCreation()}
      </div>
    );
  }
}
