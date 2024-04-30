import * as React from 'react';

import { Option } from '../../lib/types';
import { highlightFilter } from '../../lib/utils';

import { Avatar } from '@zero-tech/zui/components';

import { bemClassName } from '../../../../lib/bem';
import './user-search-results.scss';
import '../styles.scss';

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

  handleKeyDown = (id: string) => (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'Enter') {
      this.props.onCreate(id);
    }
  };

  render() {
    const { filter, results } = this.props;

    return (
      <div {...cn()}>
        <div {...cn('title')}>Start a new conversation:</div>
        {results.map((userResult) => (
          <div
            {...cn('item')}
            tabIndex={0}
            role='button'
            onKeyDown={this.handleKeyDown(userResult.value)}
            onClick={() => this.handleUserClick(userResult.value)}
            key={userResult.value}
          >
            <Avatar size='regular' imageURL={userResult.image} tabIndex={-1} />

            <div {...cn('user-details')}>
              <div {...cn('label')}>{highlightFilter(userResult.label, filter)}</div>
              {userResult?.subLabel && <div {...cn('sub-label')}>{userResult.subLabel}</div>}
            </div>
          </div>
        ))}
      </div>
    );
  }
}
