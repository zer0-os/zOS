import * as React from 'react';

import { AutocompleteMembers } from '../autocomplete-members';
import { PanelHeader } from './panel-header';
import { IconUsersPlus } from '@zero-tech/zui/icons';

import { bem } from '../../../lib/bem';
const c = bem('create-conversation');

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
        <PanelHeader title='New message' onBack={this.props.onBack} />

        <div className={c('')}>
          <div className={c('search')}>
            <AutocompleteMembers search={this.props.search} onSelect={this.userSelected}>
              <div className={c('group-button')} onClick={this.props.onStartGroupChat}>
                <div className={c('group-icon')}>
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
