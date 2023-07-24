import React from 'react';

import { bemClassName } from '../../../lib/bem';

import { IconCheck, IconXClose } from '@zero-tech/zui/icons';
import { IconButton, Tooltip } from '@zero-tech/zui/components';

import './styles.scss';

const cn = bemClassName('edit-message-actions');

export interface Properties {
  className?: string;
  onEdit: () => void;
  onCancel?: () => void;
}

export default class EditMessageActions extends React.Component<Properties> {
  render() {
    return (
      <div {...cn()}>
        <Tooltip content='Discard Changes'>
          <IconButton {...cn('icon')} onClick={this.props.onCancel} Icon={IconXClose} isFilled size={24} />
        </Tooltip>
        <Tooltip content='Save Changes'>
          <IconButton {...cn('icon')} onClick={this.props.onEdit} Icon={IconCheck} isFilled size={24} />
        </Tooltip>
      </div>
    );
  }
}
