import * as React from 'react';

import { UserSearchResultItem } from './user-search-result-item';

import { bem } from '../../../lib/bem';

const c = bem('user-search-results');

export interface Properties {
  results: any;
  onClick: (userId: string) => void;
}

export class UserSearchResults extends React.Component<Properties> {
  render() {
    return (
      <div className={c('')}>
        <div className={c('title')}>Start a new conversation:</div>
        {this.props.results.map((result) => (
          <UserSearchResultItem
            key={result.value}
            id={result.value}
            label={result.label}
            image={result.image}
            onClick={this.props.onClick}
          />
        ))}
      </div>
    );
  }
}
