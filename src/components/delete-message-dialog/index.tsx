import * as React from 'react';

import { IconButton, Modal } from '@zero-tech/zui/components';
import { Button, Variant as ButtonVariant, Color as ButtonColor } from '@zero-tech/zui/components/Button';

import { IconXClose } from '@zero-tech/zui/icons';

import { bemClassName } from '../../lib/bem';
import './styles.scss';

const cn = bemClassName('delete-message-dialog');

export interface Properties {
  onDelete: () => void;
  onClose: () => void;
}

export class DeleteMessageModal extends React.Component<Properties> {
  close = () => {
    this.props.onClose();
  };

  delete = () => {
    this.props.onDelete();
    this.close();
  };

  render() {
    return (
      <Modal {...cn('')} open>
        <div {...cn('header')}>
          <h2>Delete message</h2>
          <IconButton Icon={IconXClose} size='large' onClick={this.close} />
        </div>
        <div {...cn('text-content')}>Are you sure you want to delete this message? This cannot be undone.</div>
        <div {...cn('footer')}>
          <Button variant={ButtonVariant.Secondary} color={ButtonColor.Greyscale} onPress={this.close}>
            Cancel
          </Button>

          <Button color={ButtonColor.Red} onPress={this.delete}>
            Delete message
          </Button>
        </div>
      </Modal>
    );
  }
}
