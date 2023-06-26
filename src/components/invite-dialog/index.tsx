import * as React from 'react';

import { Image, Skeleton, Alert } from '@zero-tech/zui/components';
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
  maxUses: number;
  inviteUrl: string;
  assetsPath: string;
  isUserAMemberOfWorlds: boolean;
  clipboard?: Clipboard;

  onClose?: () => void;
}

interface State {
  copyText: string;
}

export class InviteDialog extends React.Component<Properties, State> {
  state = { copyText: 'COPY' };
  buttonTimeout = null;

  static defaultProps = { clipboard: clipboard };

  componentWillUnmount() {
    clearTimeout(this.buttonTimeout);
  }

  getInvitesRemaining() {
    return Math.max(this.props.maxUses - this.props.invitesUsed, 0);
  }

  get inviteText() {
    return (
      "Here's your invite code for ZERO Messenger:\n" +
      `${this.props.inviteCode}\n\n` +
      'Join early, earn more:\n' +
      `${this.props.inviteUrl}`
    );
  }

  writeInviteToClipboard = async () => {
    try {
      await this.props.clipboard.write(this.inviteText);
      this.setState({ copyText: 'COPIED' });
      this.buttonTimeout = setTimeout(() => this.setState({ copyText: 'COPY' }), 3000);
    } catch (e) {
      // Assume copying succeeds. There's not much we can do if it fails.
    }
  };

  render() {
    return (
      <div className={c('')}>
        <div className={c('title-bar')}>
          <h3 className={c('title')}>Invite to ZERO Messenger</h3>
          <IconButton className={c('close')} Icon={IconXClose} onClick={this.props.onClose} />
        </div>
        <div className={c('content')}>
          <Image
            src={`${this.props.assetsPath}/ReachingHands.png`}
            alt='Hands reaching out to connect'
            className={c('image')}
          />

          {this.props.isUserAMemberOfWorlds && (
            <Alert variant='info' className={c('network-alert')}>
              This invite will add someone to your direct messages, <b>not</b> your current network.
            </Alert>
          )}

          <div className={c('heading')}>Invite a friend. Chat on ZERO. Earn rewards.</div>
          <div className={c('byline')}>
            The more active you are, the more you earn. Take back ownership of your content and get rewarded.
            <br />
          </div>
          <div className={c('code-block')}>
            {this.props.inviteCode ? (
              <textarea readOnly={true} value={this.inviteText} />
            ) : (
              <Skeleton width={'100%'} height={'100px'} />
            )}
            <button
              className={c('inline-button', 'right')}
              onClick={this.writeInviteToClipboard}
              disabled={!this.props.inviteCode}
            >
              {this.state.copyText}
            </button>
          </div>
          <div
            className={classNames(c('remaining-invite'), { [c('no-invite-left')]: this.getInvitesRemaining() === 0 })}
          >
            <IconGift1 />
            <div>
              <b>{this.getInvitesRemaining()}</b> of <b>{this.props.maxUses}</b> invites remaining
            </div>
          </div>
        </div>
      </div>
    );
  }
}
