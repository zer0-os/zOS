import * as React from 'react';

import { Option } from '../lib/types';

import { Avatar } from '@zero-tech/zui/components';
import { IconXClose } from '@zero-tech/zui/icons';

import { bem } from '../../../lib/bem';
const c = bem('selected-user-tag');

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
      <div className={c('selected-option')}>
        <div className={c('selected-tag')}>
          <Avatar size={'extra small'} type={'circle'} imageURL={option.image} />
          <span className={c('user-label')}>{option.label}</span>
          {this.props.onRemove && (
            <button onClick={this.publishRemove} data-value={option.value} className={c('user-remove')}>
              <IconXClose size={16} />
            </button>
          )}
        </div>
      </div>
    );
  }
}
