import React from 'react';
import classNames from 'classnames';
import { Channel } from '../../../store/channels';
import { User } from '../../../store/channels';

import './styles.scss';
export interface Properties {
  className?: string;
  placeholder?: string;
  directMessagesList?: Channel[];

  onInputChange: (value: string) => void;
  mapSearchConversationsText: (directMessages: User[]) => string;
}

interface State {}

export class SearchConversations extends React.Component<Properties, State> {
  publishSearch = (search) => {
    this.props.onInputChange(search?.target?.value ?? '');
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
