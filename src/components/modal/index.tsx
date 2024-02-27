import * as React from 'react';

import { IconButton, Modal as ZuiModal } from '@zero-tech/zui/components';
import { IconXClose } from '@zero-tech/zui/icons';

import { bemClassName } from '../../lib/bem';
import './styles.scss';

const cn = bemClassName('modal');

export interface Properties {
  title: string;

  onClose: () => void;
}

export class Modal extends React.Component<Properties> {
  publishIfClosing = (open: boolean) => {
    if (!open) {
      this.props.onClose();
    }
  };

  render() {
    return (
      <ZuiModal open={true} onOpenChange={this.publishIfClosing}>
        <div {...cn('')}>
          <div {...cn('title-bar')}>
            <h3 {...cn('title')}>{this.props.title}</h3>
            <IconButton {...cn('close')} size='large' Icon={IconXClose} onClick={this.props.onClose} />
          </div>
        </div>
        {this.props.children}
        <div {...cn('footer')}></div>
      </ZuiModal>
    );
  }
}
