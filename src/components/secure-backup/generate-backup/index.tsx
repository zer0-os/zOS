import * as React from 'react';

import { bemClassName } from '../../../lib/bem';
import { clipboard } from '../../../lib/clipboard';

import { Button, Variant as ButtonVariant } from '@zero-tech/zui/components/Button';

import '../styles.scss';

const cn = bemClassName('secure-backup');

export interface Properties {
  recoveryKey: string;
  errorMessage: string;

  clipboard?: Clipboard;

  onKeyCopied: () => void;
}

export interface State {
  hasCopied: boolean;
}

export interface Clipboard {
  write: (text: string) => Promise<void>;
}

export class GenerateBackup extends React.Component<Properties, State> {
  static defaultProps = { clipboard: clipboard };

  state = { hasCopied: false };

  copyKey = () => {
    this.props.clipboard.write(this.props.recoveryKey);
    this.setState({ hasCopied: true });
    this.props.onKeyCopied();
  };

  get copyButtonText() {
    return this.state.hasCopied ? 'Copied' : 'Copy';
  }

  render() {
    return (
      <>
        <div {...cn('recovery-key-container')}>
          <p {...cn('primary-text')}>
            This backup phrase can be entered to view past messages on <em>any device, anywhere</em>. Store it securely
            and never share it with anyone:
          </p>

          <div {...cn('recovery-key')}>{this.props.recoveryKey}</div>

          <Button onPress={this.copyKey} variant={ButtonVariant.Secondary}>
            {this.copyButtonText}
          </Button>

          {this.props.errorMessage && <p {...cn('error-message')}>{this.props.errorMessage}</p>}
        </div>
      </>
    );
  }
}
