import * as React from 'react';

import { AutocompleteMembers } from '../../autocomplete-members';
import { PanelHeader } from '../panel-header';
import { IconUsersPlus } from '@zero-tech/zui/icons';

import { bemClassName } from '../../../../lib/bem';
import './create-conversation-panel.scss';

const cn = bemClassName('create-conversation');

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
      <>
        <PanelHeader title='New Conversation' onBack={this.props.onBack} />

        <div {...cn('')}>
          <div {...cn('search')}>
            <AutocompleteMembers search={this.props.search} onSelect={this.userSelected}>
              <div {...cn('group-button')} onClick={this.props.onStartGroupChat}>
                <div {...cn('group-icon')}>
                  <IconUsersPlus size={25} />
                </div>
                Start a group chat
              </div>
            </AutocompleteMembers>
          </div>
        </div>
      </>
    );
  }
}
