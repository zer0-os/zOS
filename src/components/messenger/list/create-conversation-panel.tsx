import * as React from 'react';

import { AutocompleteMembers } from '../autocomplete-members';

export interface Properties {
  search: (input: string) => any;

  onBack: () => void;
  onCreate: (id: string) => void;
  onStartGroupChat: () => void;
}

export default class CreateConversationPanel extends React.Component<Properties> {
  userSelected = (option) => {
    this.props.onCreate(option.value);
  };

  render() {
    return (
      <div className='start__chat'>
        <span className='start__chat-title'>
          <i
            className='start__chat-return'
            onClick={this.props.onBack}
          />
          New message
        </span>
        <div className='start__chat-search'>
          <AutocompleteMembers
            search={this.props.search}
            onSelect={this.userSelected}
          >
            <div
              className='create-conversation__group-button'
              onClick={this.props.onStartGroupChat}
            >
              Start a group chat
            </div>
          </AutocompleteMembers>
        </div>
      </div>
    );
  }
}
