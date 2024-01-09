import * as React from 'react';

import { IconButton, Button } from '@zero-tech/zui/components';
import { IconXClose } from '@zero-tech/zui/icons';

import { bemClassName } from '../../lib/bem';

import './styles.scss';

const cn = bemClassName('error-dialog');

export interface Properties {
  onClose?: () => void;
}

export class ErrorDialog extends React.Component<Properties> {
  render() {
    return (
      <div {...cn('')}>
        <IconButton {...cn('close')} size={40} Icon={IconXClose} onClick={this.props.onClose} />

        <div {...cn('heading-container')}>
          <div {...cn('header')}>Access Denied</div>
        </div>
        <div {...cn('body')}>You are not a member of this conversation.</div>
        <div {...cn('footer')}>
          <Button onPress={this.props.onClose} variant='text'>
            Dismiss
          </Button>
        </div>
      </div>
    );
  }
}
