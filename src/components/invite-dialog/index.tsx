import * as React from 'react';

import { Button, Image, Modal } from '@zero-tech/zui/components';
import { clipboard } from '../../lib/clipboard';

import './styles.scss';

import { bem } from '../../lib/bem';
const c = bem('invite-dialog');

export interface Clipboard {
  write: (text: string) => Promise<void>;
}

export interface Properties {
  inviteCode: string;
  clipboard?: Clipboard;
}

interface State {
  copyText: string;
}

export class InviteDialog extends React.Component<Properties, State> {
  state = { copyText: 'Copy' };
  buttonTimeout = null;

  static defaultProps = { clipboard: clipboard };

  componentWillUnmount() {
    clearTimeout(this.buttonTimeout);
  }

  render() {
    return <Modal trigger={<Button>Invite</Button>}>{this.renderContent()}</Modal>;
  }

  get inviteText() {
    return (
      'Here is an invite code for Zero messenger:\n' +
      `${this.props.inviteCode}\n\n` +
      'Get exclusive access:\n' +
      'https://zero.tech/get-access'
    );
  }

  writeInviteToClipboard = async () => {
    try {
      await this.props.clipboard.write(this.inviteText);
      this.setState({ copyText: 'Copied' });
      this.buttonTimeout = setTimeout(() => this.setState({ copyText: 'Copy' }), 3000);
    } catch (e) {
      // Assume copying succeeds. There's not much we can do if it fails.
    }
  };

  renderContent() {
    return (
      <div className={c('')}>
        <div className={c('title-bar')}>
          <h3 className={c('title')}>Invite to Messenger</h3>
        </div>
        <div className={c('content')}>
          <Image
            src='https://res.cloudinary.com/fact0ry/image/upload/v1681745540/zero-assets/zos/ReachingHands.png'
            alt='Hands reaching out to connect'
            className={c('image')}
          />
          <div className={c('heading')}>Invite a friend, speak on Zero and both earn more rewards</div>
          <div className={c('byline')}>
            The larger and more active your network of contacts is, the more you will receive in rewards. Let's take
            back ownership of our social platforms.
            <br />
            <br />
          </div>
          <div className={c('code-block')}>
            <div>
              <div>Here's an invite code for Zero messenger:</div>
              <div className={c('code')}>{this.props.inviteCode}</div>
              <br />
              <div>Get exclusive access:</div>
              <div>https://zero.tech/get-access</div>
            </div>
            <button className={c('inline-button', 'right')} onClick={this.writeInviteToClipboard}>
              {this.state.copyText}
            </button>
          </div>
        </div>
      </div>
    );
  }
}
