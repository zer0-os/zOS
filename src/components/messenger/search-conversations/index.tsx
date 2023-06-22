import React, { Component } from 'react';

import { Input } from '@zero-tech/zui/components';

import classNames from 'classnames';
import './styles.scss';

export interface Properties {
  className?: string;
  placeholder?: string;

  onChange: (value: string) => void;
  searchQuery: string;
}

export class SearchConversations extends Component<Properties> {
  render() {
    return (
      <div className={classNames('search_conversation', this.props.className)}>
        <Input
          autoFocus
          type='search'
          className='search_conversation-input'
          placeholder={this.props.placeholder}
          onChange={this.props.onChange}
          value={this.props.searchQuery}
          size={'small'}
        />
      </div>
    );
  }
}
