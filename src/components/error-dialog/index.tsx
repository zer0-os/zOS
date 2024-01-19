import * as React from 'react';

import { IconButton, Button } from '@zero-tech/zui/components';
import { IconXClose } from '@zero-tech/zui/icons';

import { bemClassName } from '../../lib/bem';

import './styles.scss';

const cn = bemClassName('error-dialog');

export interface Properties {
  header: string;
  body: string;

  onClose?: () => void;
}

export class ErrorDialog extends React.Component<Properties> {
  render() {
    const { header, body, onClose } = this.props;

    return (
      <div {...cn('')}>
        <IconButton {...cn('close')} size={40} Icon={IconXClose} onClick={onClose} />

        <div {...cn('heading-container')}>
          <div {...cn('header')}>{header}</div>
        </div>
        <div {...cn('body')}>{body}</div>
        <div {...cn('footer')}>
          <Button onPress={onClose} variant='text'>
            Dismiss
          </Button>
        </div>
      </div>
    );
  }
}
