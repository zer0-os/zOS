import * as React from 'react';

import { Option } from '../autocomplete-members';

import { Avatar } from '@zero-tech/zui/components';
import { IconXClose } from '@zero-tech/zui/icons';

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
      <div className='start-group-panel__selected-option' key={option.value}>
        <div className='start-group-panel__selected-tag'>
          <Avatar size={'extra small'} type={'circle'} imageURL={option.image} />
          <span className='start-group-panel__user-label'>{option.label}</span>
          {this.props.onRemove && (
            <button onClick={this.publishRemove} data-value={option.value} className='start-group-panel__user-remove'>
              <IconXClose size={16} />
            </button>
          )}
        </div>
      </div>
    );
  }
}
