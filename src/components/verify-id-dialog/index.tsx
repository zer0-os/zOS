import * as React from 'react';

import { config } from '../../config';

import { IconXClose } from '@zero-tech/zui/icons';
import { IconButton } from '@zero-tech/zui/components';

import { bemClassName } from '../../lib/bem';

import './styles.scss';

const cn = bemClassName('verify-id-dialog');

export interface Properties {
  onClose: () => void;
}

export class VerifyIdDialog extends React.Component<Properties> {
  renderLink() {
    return (
      <a {...cn('link')} href={config.znsExplorerUrl} target='_blank' rel='noopener noreferrer'>
        Explorer
      </a>
    );
  }

  renderExampleZids() {
    return (
      <>
        <span {...cn('zid')}>0://john</span> or <span {...cn('zid')}>0://john.smith</span>
      </>
    );
  }

  render() {
    return (
      <div {...cn('')}>
        <div {...cn('heading-container')}>
          <div {...cn('header')}>Verify ID</div>
          <IconButton {...cn('close')} size={32} Icon={IconXClose} onClick={this.props.onClose} />
        </div>

        <div {...cn('text-content')}>
          <p>You can verify your ID in Messenger if you own a ZERO ID domain, e.g. {this.renderExampleZids()}.</p>
          <p>
            To verify your ID, make sure your ZERO ID is in the Web3 wallet associated with your Messenger account, and
            click on your profile picture. Then, select “Edit Profile” and pick from the dropdown list of ZERO ID
            options.
          </p>
          <p>To purchase a ZERO ID, visit ZERO’s {this.renderLink()} app.</p>
        </div>
      </div>
    );
  }
}
