import * as React from 'react';

import { AutocompleteMembers } from '../autocomplete-members';

export interface Properties {
  toggleConversation: () => void;
  usersInMyNetworks: (input: string) => any;
  createOneOnOneConversation: (id: string) => void;
}

export default class CreateConversationPanel extends React.Component<Properties> {
  render() {
    return (
      <div className='start__chat'>
        <span className='start__chat-title'>
          <i
            className='start__chat-return'
            onClick={this.props.toggleConversation}
          />
          New message
        </span>
        <div className='start__chat-search'>
          <AutocompleteMembers
            search={this.props.usersInMyNetworks}
            onSelect={this.props.createOneOnOneConversation}
          ></AutocompleteMembers>
        </div>
      </div>
    );
  }
}
