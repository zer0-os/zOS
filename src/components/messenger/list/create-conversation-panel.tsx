import * as React from 'react';

import { AutocompleteMembers } from '../autocomplete-members';

export interface Properties {
  onBack: () => void;
  search: (input: string) => any;
  onCreate: (id: string) => void;
}

export default class CreateConversationPanel extends React.Component<Properties> {
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
            onSelect={this.props.onCreate}
          ></AutocompleteMembers>
        </div>
      </div>
    );
  }
}
