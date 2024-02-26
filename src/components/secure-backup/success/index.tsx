import * as React from 'react';

import { bemClassName } from '../../../lib/bem';

import { Button } from '@zero-tech/zui/components';

import '../styles.scss';

const cn = bemClassName('secure-backup');

export interface Properties {
  successMessage: string;
  onClose: () => void;
}

export class Success extends React.Component<Properties> {
  closeBackup = () => {
    this.props.onClose();
  };

  render() {
    return (
      <>
        <p {...cn('success-message')}>{this.props.successMessage}</p>

        <div {...cn('footer')}>
          <Button {...cn('button')} onPress={this.closeBackup}>
            Finish
          </Button>
        </div>
      </>
    );
  }
}
