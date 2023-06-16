import React, { Component } from 'react';

import { Input } from '@zero-tech/zui/components';

import classNames from 'classnames';
import './styles.scss';

export interface Properties {
  className?: string;
  placeholder?: string;

  onChange: (value: string) => void;
}

interface State {
  search: string;
}

export class SearchConversations extends Component<Properties, State> {
  constructor(props) {
    super(props);
    this.state = {
      search: '',
    };
  }

  publishSearch = (search) => {
    this.setState({ search: search ?? '' });
    this.props.onChange(search ?? '');
  };

  render() {
    const { className, placeholder } = this.props;
    const { search } = this.state;

    return (
      <div className={classNames('search_conversation', className)}>
        <Input
          autoFocus
          type='search'
          placeholder={placeholder}
          onChange={this.publishSearch}
          value={search}
          size={'small'}
        />
      </div>
    );
  }
}
