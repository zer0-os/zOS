import * as React from 'react';

import { bemClassName } from '../../../lib/bem';

import { Button } from '@zero-tech/zui/components';
import { IconArrowRight } from '@zero-tech/zui/icons';

import '../styles.scss';

const cn = bemClassName('secure-backup');

export interface Properties {
  recoveryKey: string;
  hasCopied: boolean;
  errorMessage: string;

  onCopy: () => void;
  onSave: () => void;
}

export class GenerateBackup extends React.Component<Properties> {
  onSave = () => {
    this.props.onSave();
  };

  onCopy = () => {
    this.props.onCopy();
  };

  get copyButtonText() {
    return this.props.hasCopied ? 'Copied' : 'Copy';
  }

  render() {
    return (
      <>
        <div {...cn('recovery-key-container')}>
          <p {...cn('primary-text')}>
            This backup phrase can be entered to view past messages on <em>any device, anywhere</em>. Store it securely
            and never share it with anyone:
          </p>

          {this.props.recoveryKey && <div {...cn('recovery-key')}>{this.props.recoveryKey}</div>}

          {this.props.recoveryKey && (
            <Button {...cn('button')} onPress={this.onCopy} variant='text'>
              {this.copyButtonText}
            </Button>
          )}

          {this.props.errorMessage && <p {...cn('error-message')}>{this.props.errorMessage}</p>}
        </div>

        <div {...cn('footer')}>
          <Button
            {...cn('button')}
            onPress={this.onSave}
            isDisabled={!this.props.hasCopied}
            endEnhancer={<IconArrowRight isFilled size={24} />}
          >
            I’ve safely stored my backup
          </Button>
        </div>
      </>
    );
  }
}
