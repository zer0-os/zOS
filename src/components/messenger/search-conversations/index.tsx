import React from 'react';
import classNames from 'classnames';

import './styles.scss';
export interface Properties {
  className?: string;
  placeholder?: string;

  onChange: (value: string) => void;
}

export class SearchConversations extends React.Component<Properties> {
  publishSearch = (search) => {
    this.props.onChange(search?.target?.value ?? '');
  };

  render() {
    return (
      <div className={classNames('search_conversation', this.props.className)}>
        <input
          autoFocus
          type='search'
          placeholder={this.props.placeholder}
          className='search_conversation-input'
          onChange={this.publishSearch}
        />
      </div>
    );
  }
}
