import * as React from 'react';

import { Option } from '../lib/types';
import { highlightFilter } from '../lib/utils';

import { Avatar } from '@zero-tech/zui/components';

import { bemClassName } from '../../../lib/bem';

const cn = bemClassName('user-search-results');

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
      <div {...cn()}>
        <div {...cn('title')}>Start a new conversation:</div>
        {results.map((userResult) => (
          <div {...cn('item')} onClick={() => this.handleUserClick(userResult.value)} key={userResult.value}>
            <Avatar size='regular' type='circle' imageURL={userResult.image} />
            <div {...cn('label')}>{highlightFilter(userResult.label, filter)}</div>
          </div>
        ))}
      </div>
    );
  }
}
