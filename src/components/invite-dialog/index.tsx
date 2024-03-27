import * as React from 'react';

import { Image, IconButton, Button } from '@zero-tech/zui/components';
import { IconXClose } from '@zero-tech/zui/icons';

import { clipboard } from '../../lib/clipboard';
import { bemClassName } from '../../lib/bem';
import { config } from '../../config';

import './styles.scss';

const cn = bemClassName('invite-dialog');

export interface Clipboard {
  write: (text: string) => Promise<void>;
}

export interface Properties {
  inviteCode: string;
  inviteCount: number;
  inviteUrl: string;
  assetsPath: string;
  isLoading: boolean;
  clipboard?: Clipboard;

  onClose?: () => void;
}

interface State {
  copyText: string;
}

export class InviteDialog extends React.Component<Properties, State> {
  state = { copyText: 'Copy Invite Code' };
  buttonTimeout = null;

  static defaultProps = { clipboard: clipboard };

  componentWillUnmount() {
    clearTimeout(this.buttonTimeout);
  }

  getInvitesRemaining() {
    return this.props.inviteCount;
  }

  get inviteText() {
    return `Use this code to join me on ZERO Messenger: ${this.props.inviteCode} ${config.inviteUrl}`;
  }

  writeInviteToClipboard = async () => {
    try {
      await this.props.clipboard.write(this.inviteText);
      this.setState({ copyText: 'Copied' });
      this.buttonTimeout = setTimeout(() => this.setState({ copyText: 'Copy Invite Code' }), 3000);
    } catch (e) {
      // Assume copying succeeds. There's not much we can do if it fails.
    }
  };

  render() {
    return (
      <div {...cn('')}>
        <IconButton {...cn('close')} size={40} Icon={IconXClose} onClick={this.props.onClose} />

        <Image
          {...cn('image')}
          src={`${this.props.assetsPath}/InviteFriends.png`}
          alt='Hands reaching out to connect'
        />
        <div {...cn('heading')}>Invite a friend. Earn rewards.</div>

        <div>
          <Button onPress={this.writeInviteToClipboard} isDisabled={!this.props.inviteCode}>
            {this.state.copyText}
          </Button>

          <div {...cn('remaining-invite-container')}>
            {!this.props.isLoading && (
              <>
                <div {...cn('remaining-invite')}>{this.getInvitesRemaining()}</div>
                <>Remaining</>
              </>
            )}
          </div>
        </div>
      </div>
    );
  }
}
