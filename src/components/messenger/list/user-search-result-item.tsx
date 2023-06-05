import * as React from 'react';

import { Avatar } from '@zero-tech/zui/components';

import { bem } from '../../../lib/bem';

const c = bem('user-search-results-item');

export interface Properties {
  id: string;
  label: string;
  image?: string;
  onClick: (userId: string) => void;
}

export class UserSearchResultItem extends React.Component<Properties> {
  handleUserClick = () => {
    this.props.onClick(this.props.id);
  };

  render() {
    return (
      <div className={c('')} onClick={this.handleUserClick}>
        <Avatar size='regular' type='circle' imageURL={this.props.image} />
        <div className={c('label')}>{this.props.label}</div>
      </div>
    );
  }
}
