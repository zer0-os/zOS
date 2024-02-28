import * as React from 'react';

import { bemClassName } from '../../../lib/bem';
import { clipboard } from '../../../lib/clipboard';

import { Button } from '@zero-tech/zui/components';
import { IconArrowRight } from '@zero-tech/zui/icons';

import '../styles.scss';

const cn = bemClassName('secure-backup');

export interface Properties {
  recoveryKey: string;
  errorMessage: string;

  clipboard?: Clipboard;

  onNext: () => void;
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
  };

  next = () => {
    this.props.onNext();
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

          <Button {...cn('button')} onPress={this.copyKey} variant='text'>
            {this.copyButtonText}
          </Button>

          {this.props.errorMessage && <p {...cn('error-message')}>{this.props.errorMessage}</p>}
        </div>

        <div {...cn('footer')}>
          <Button
            {...cn('button')}
            onPress={this.next}
            isDisabled={!this.state.hasCopied}
            endEnhancer={<IconArrowRight isFilled size={24} />}
          >
            I’ve safely stored my backup
          </Button>
        </div>
      </>
    );
  }
}
