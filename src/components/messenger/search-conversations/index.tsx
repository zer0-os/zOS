import React from 'react';
import classNames from 'classnames';
import { Channel } from '../../../store/channels';
import { User } from '../../../store/channels';

import './styles.scss';
export interface Properties {
  className?: string;
  placeholder?: string;
  directMessagesList?: Channel[];

  onChange: (directMessages: Channel[]) => void;
  mapSearchConversationsText: (directMessages: User[]) => string;
}

interface State {}

export class SearchConversations extends React.Component<Properties, State> {
  searchConversations = (search) => {
    const expression = search.target.value ? `(${search.target.value})` : '(.*)';
    const searchRegEx = new RegExp(expression, 'i');

    const directMessagesList = this.props.directMessagesList.filter((conversation) =>
      searchRegEx.test(this.props.mapSearchConversationsText(conversation.otherMembers))
    );

    this.props.onChange(directMessagesList);
  };

  render() {
    return (
      <div className={classNames('search_conversation', this.props.className)}>
        <input
          autoFocus
          type='search'
          placeholder={this.props.placeholder}
          className='search_conversation-input'
          onChange={this.searchConversations}
        />
      </div>
    );
  }
}
