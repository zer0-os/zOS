import * as React from 'react';

import { ToggleGroup } from '@zero-tech/zui/components';

import { bemClassName } from '../../lib/bem';

import './styles.scss';

const cn = bemClassName('select-method');

export interface Properties {
  onEmailSelected: () => void;
  onWalletSelected: () => void;
}

export class SelectMethod extends React.PureComponent<Properties, { selectedMethod: string }> {
  constructor(props: Properties) {
    super(props);
    this.state = {
      selectedMethod: 'web3',
    };
  }

  handleSelectionChange = (selection: string) => {
    this.setState({ selectedMethod: selection });

    if (selection === 'email') {
      this.props.onEmailSelected();
    } else if (selection === 'web3') {
      this.props.onWalletSelected();
    }
  };

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
          variant='default'
          onSelectionChange={this.handleSelectionChange}
          selection={this.state.selectedMethod}
          selectionType='single'
          isRequired
        />
      </div>
    );
  }
}
