import * as React from 'react';

import { bemClassName } from '../../lib/bem';
import { getUserSubHandle } from '../../lib/user';

import './styles.scss';

import { Wallet } from '../../store/authentication/types';
import { Avatar, Badge } from '@zero-tech/zui/components';
import { IconXClose } from '@zero-tech/zui/icons';
import Tooltip from '../tooltip';

const cn = bemClassName('wallet-list-item');

export interface Properties {
  wallet: Wallet;
  tag?: string;
  tagDescription?: string;
  onRemove?: () => void;
}

export class WalletListItem extends React.Component<Properties> {
  render() {
    return (
      <div {...cn('')} tabIndex={0}>
        <div {...cn('container')}>
          <div {...cn('details')}>
            <Avatar size={'medium'} imageURL={''} tabIndex={-1} />
            <div {...cn('text-container')}>
              <span {...cn('wallet')}>{getUserSubHandle('', this.props.wallet.publicAddress)}</span>
            </div>
          </div>

          {this.props.onRemove && (
            <div {...cn('remove')} onClick={this.props.onRemove}>
              <IconXClose size={16} />
            </div>
          )}
        </div>
        {this.props.tag && (
          <Tooltip placement='top' overlay={this.props.tagDescription}>
            <div {...cn('tag')}>
              <Badge content={this.props.tag} variant='offline' type='text' />
            </div>
          </Tooltip>
        )}
      </div>
    );
  }
}
