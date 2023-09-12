import * as React from 'react';

import { Image, Skeleton, Alert, IconButton } from '@zero-tech/zui/components';
import { IconXClose, IconGift1 } from '@zero-tech/zui/icons';

import { clipboard } from '../../lib/clipboard';

import './styles.scss';

import { bem, bemClassName } from '../../lib/bem';
import classNames from 'classnames';

const c = bem('invite-dialog');
const cn = bemClassName('invite-dialog');

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
  isLoading: boolean;
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
      // eslint-disable-next-line
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
      <div {...cn('')}>
        <div {...cn('title-bar')}>
          <h3 {...cn('title')}>Invite to ZERO Messenger</h3>
          <IconButton {...cn('close')} size={32} Icon={IconXClose} onClick={this.props.onClose} />
        </div>
        <div {...cn('content')}>
          <Image
            src={`${this.props.assetsPath}/InviteFriends.png`}
            alt='Hands reaching out to connect'
            {...cn('image')}
          />

          {this.props.isUserAMemberOfWorlds && (
            <Alert variant='info' {...cn('network-alert')}>
              This invite will add someone to your direct messages, <b>not</b> your current network.
            </Alert>
          )}

          <div {...cn('heading')}>Invite a friend. Chat on ZERO. Earn rewards.</div>
          <div {...cn('byline')}>
            The more active you are, the more you earn. Take back ownership of your content and get rewarded.
            <br />
          </div>
          <div {...cn('code-block')}>
            {this.props.inviteCode || !this.props.isLoading ? (
              <textarea readOnly={true} value={this.inviteText} />
            ) : (
              <Skeleton width={'100%'} height={'100px'} />
            )}
            <button
              {...cn('inline-button', 'right')}
              onClick={this.writeInviteToClipboard}
              disabled={!this.props.inviteCode}
            >
              {this.state.copyText}
            </button>
          </div>
          <div
            className={classNames(c('remaining-invite-container'), {
              [c('invite-left')]: this.getInvitesRemaining() !== 0 && !this.props.isLoading,
            })}
          >
            <IconGift1 />
            <div {...cn(!this.props.isLoading && 'remaining-invite')}>
              {!this.props.isLoading && (
                <>
                  <b>{this.getInvitesRemaining()}</b> of <b>{this.props.maxUses}</b> invites remaining
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }
}
