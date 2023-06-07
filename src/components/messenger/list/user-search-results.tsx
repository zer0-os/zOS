import * as React from 'react';

import { Option } from '../lib/types';

import { Avatar } from '@zero-tech/zui/components';

import { bem } from '../../../lib/bem';
import { highlightFilter } from './utils';

const c = bem('user-search-results');

export interface Properties {
  filter: string;
  results: Option[];
  onCreate: (userId: string) => void;
}

export class UserSearchResults extends React.Component<Properties> {
  handleUserClick = (id: string) => {
    this.props.onCreate(id);
  };

  render() {
    const { filter, results } = this.props;

    return (
      <div className={c('')}>
        <div className={c('title')}>Start a new conversation:</div>
        {results.map((userResult) => (
          <div key={userResult.value} className={c('item')} onClick={() => this.handleUserClick(userResult.value)}>
            <Avatar size='regular' type='circle' imageURL={userResult.image} />
            <div className={c('label')}>{highlightFilter(userResult.label, filter)}</div>
          </div>
        ))}
      </div>
    );
  }
}
