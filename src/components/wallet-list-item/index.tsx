import * as React from 'react';

import { bemClassName } from '../../lib/bem';
import { getUserSubHandle } from '../../lib/user';

import './styles.scss';

import { Wallet } from '../../store/authentication/types';
import { Avatar } from '@zero-tech/zui/components';

const cn = bemClassName('wallet-list-item');

export interface Properties {
  wallet: Wallet;
  tag?: string;
}

export class WalletListItem extends React.Component<Properties> {
  render() {
    return (
      <div {...cn('')} tabIndex={0}>
        <div {...cn('details')}>
          <Avatar size={'medium'} imageURL={''} tabIndex={-1} />
          <div {...cn('text-container')}>
            <span {...cn('wallet')}>{getUserSubHandle('', this.props.wallet.publicAddress)}</span>
          </div>
        </div>

        {this.props.tag && <div {...cn('tag')}>{this.props.tag}</div>}
      </div>
    );
  }
}
