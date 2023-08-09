import * as React from 'react';

import { Option } from '../lib/types';

import { Avatar } from '@zero-tech/zui/components';
import { IconXClose } from '@zero-tech/zui/icons';

import { bemClassName } from '../../../lib/bem';

const cn = bemClassName('selected-user-tag');

export interface Properties {
  userOption: Option;

  onRemove?: (id: string) => void;
}

export class SelectedUserTag extends React.Component<Properties> {
  publishRemove = () => {
    this.props.onRemove(this.props.userOption.value);
  };

  render() {
    const { userOption: option } = this.props;

    return (
      <div {...cn('selected-option')}>
        <div {...cn('selected-tag')}>
          <Avatar size={'extra small'} type={'circle'} imageURL={option.image} />
          <span {...cn('user-label')}>{option.label}</span>
          {this.props.onRemove && (
            <button {...cn('user-remove')} onClick={this.publishRemove} data-value={option.value}>
              <IconXClose size={16} />
            </button>
          )}
        </div>
      </div>
    );
  }
}
