import React from 'react';
import classNames from 'classnames';

import './styles.scss';
import { Channel } from '../../../store/channels';
import { mapMembersToString } from './utils';

export interface Properties {
  className?: string;
  placeholder?: string;
  directMessagesList?: Channel[];

  onChange: (directMessages: Channel[]) => void;
}

interface State {}

export class SearchConversations extends React.Component<Properties, State> {
  searchConverstions = (search) => {
    const expression = search.target.value ? `(${search.target.value})` : '(.*)';
    const searchRegEx = new RegExp(expression, 'i');

    const directMessagesList = this.props.directMessagesList.filter((conversation) =>
      searchRegEx.test(mapMembersToString(conversation.otherMembers))
    );

    this.props.onChange(directMessagesList);
  };

  render() {
    return (
      <div className={classNames('search_conversation', this.props.className)}>
        <input
          type='search'
          placeholder={this.props.placeholder}
          className='search_conversation-input'
          onChange={this.searchConverstions}
        />
      </div>
    );
  }
}
