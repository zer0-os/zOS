import * as React from 'react';

import { Image, Skeleton } from '@zero-tech/zui/components';
import { IconXClose, IconGift1 } from '@zero-tech/zui/icons';

import { clipboard } from '../../lib/clipboard';
import { IconButton } from '../icon-button';

import './styles.scss';

import { bem } from '../../lib/bem';
import classNames from 'classnames';
const c = bem('invite-dialog');

export interface Clipboard {
  write: (text: string) => Promise<void>;
}

export interface Properties {
  inviteCode: string;
  invitesUsed: number;
  maxInvitesPerUser: number;
  inviteUrl: string;
  assetsPath: string;
  clipboard?: Clipboard;

  onClose?: () => void;
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

  getInvitesRemaining() {
    return Math.max(this.props.maxInvitesPerUser - this.props.invitesUsed, 0);
  }

  get inviteText() {
    return (
      'Here is an invite code for Zero messenger:\n' +
      `${this.props.inviteCode}\n\n` +
      'Get exclusive access:\n' +
      `${this.props.inviteUrl}`
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

  render() {
    return (
      <div className={c('')}>
        <div className={c('title-bar')}>
          <h3 className={c('title')}>Invite to Messenger</h3>
          <IconButton className={c('close')} Icon={IconXClose} onClick={this.props.onClose} />
        </div>
        <div className={c('content')}>
          <Image
            src={`${this.props.assetsPath}/ReachingHands.png`}
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
            {!this.props.inviteCode && <Skeleton width={'100%'} height={'96px'} />}
            {this.props.inviteCode && <pre>{this.inviteText}</pre>}
            <button
              className={c('inline-button', 'right')}
              onClick={this.writeInviteToClipboard}
              disabled={!this.props.inviteCode}
            >
              {this.state.copyText}
            </button>
          </div>
          <div className={c('remaining-invite')}>
            <IconGift1
              className={classNames({
                [c('no-invite-left')]: this.getInvitesRemaining() === 0,
              })}
            />
            <div
              className={classNames({
                [c('no-invite-left')]: this.getInvitesRemaining() === 0,
              })}
            >
              <b>{this.getInvitesRemaining()}</b> of <b>{this.props.maxInvitesPerUser}</b> invites remaining
            </div>
          </div>
        </div>
      </div>
    );
  }
}
