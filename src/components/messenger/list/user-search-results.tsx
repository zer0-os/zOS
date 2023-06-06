import * as React from 'react';

import { Option } from '../lib/types';

import { Avatar } from '@zero-tech/zui/components';

import { bem } from '../../../lib/bem';

const c = bem('user-search-results');

export interface Properties {
  results: Option[];
  onCreate: (userId: string) => void;
}

export class UserSearchResults extends React.Component<Properties> {
  handleUserClick = (id: string) => {
    this.props.onCreate(id);
  };

  render() {
    return (
      <div className={c('')}>
        <div className={c('title')}>Start a new conversation:</div>
        {this.props.results.map((userResult) => (
          <div key={userResult.value} className={c('item')} onClick={() => this.handleUserClick(userResult.value)}>
            <Avatar size='regular' type='circle' imageURL={userResult.image} />
            <div className={c('label')}>{userResult.label}</div>
          </div>
        ))}
      </div>
    );
  }
}
