import * as React from 'react';

import { otherMembersToString } from '../../../platform-apps/channels/util';
import { Channel } from '../../../store/channels';
import { IconPlus, IconUserPlus1 } from '@zero-tech/zui/icons';
import { IconButton } from '../../icon-button';
import { ConversationItem } from './conversation-item';
import { InviteDialogContainer } from '../../invite-dialog/container';
import { Button, Input, Modal } from '@zero-tech/zui/components';
import { Item, Option } from '../lib/types';
import { UserSearchResults } from './user-search-results';
import { itemToOption } from '../lib/utils';
import { ScrollbarContainer } from '../../scrollbar-container';
import escapeRegExp from 'lodash/escapeRegExp';

export interface Properties {
  conversations: Channel[];
  myUserId: string;
  activeConversationId: string;

  search: (input: string) => any;
  startConversation: () => void;
  onCreateConversation: (userId: string) => void;
  onConversationClick: (conversationId: string) => void;
}

interface State {
  filter: string;
  inviteDialogOpen: boolean;
  userSearchResults: Option[];
}

export class ConversationListPanel extends React.Component<Properties, State> {
  state = { filter: '', inviteDialogOpen: false, userSearchResults: [] };

  searchChanged = async (search: string) => {
    const tempSearch = search;

    if (!tempSearch) {
      return this.setState({ filter: tempSearch, userSearchResults: [] });
    }

    this.setState({ filter: tempSearch });

    const oneOnOneConversations = this.props.conversations.filter((c) => c.otherMembers.length === 1);
    const oneOnOneConversationMemberIds = oneOnOneConversations.flatMap((c) => c.otherMembers.map((m) => m.userId));

    const items: Item[] = await this.props.search(tempSearch);
    const filteredItems = items?.filter((item) => !oneOnOneConversationMemberIds.includes(item.id));

    this.setState({ userSearchResults: filteredItems?.map(itemToOption) });
  };

  get filteredConversations() {
    if (this.state.filter === '') {
      return this.props.conversations;
    }

    const searchRegEx = new RegExp(escapeRegExp(this.state.filter), 'i');
    return this.props.conversations.filter(
      (conversation) =>
        conversation.otherMembers.length === 1
          ? searchRegEx.test(otherMembersToString(conversation.otherMembers)) // for one-to-one
          : searchRegEx.test(conversation.name ?? '') // for group
    );
  }

  openInviteDialog = (): void => {
    this.setState({ inviteDialogOpen: true });
  };

  closeInviteDialog = (): void => {
    this.setState({ inviteDialogOpen: false });
  };

  renderInviteDialog = (): JSX.Element => {
    return (
      <Modal open={this.state.inviteDialogOpen} onOpenChange={this.closeInviteDialog}>
        <InviteDialogContainer onClose={this.closeInviteDialog} />
      </Modal>
    );
  };

  openExistingConversation = (id: string) => {
    this.props.onConversationClick(id);
    this.setState({ filter: '' });
  };

  createNewConversation = (userId: string) => {
    this.props.onCreateConversation(userId);
    this.setState({ filter: '' });
  };

  render() {
    return (
      <>
        <div className='messages-list__items'>
          <div className='messages-list__items-actions'>
            <Input
              className='messages-list__items-conversations-search'
              onChange={this.searchChanged}
              size={'small'}
              type={'search'}
              placeholder='Search'
              value={this.state.filter}
            />
            <div className='messages-list__items-conversations-new'>
              <IconButton Icon={IconPlus} onClick={this.props.startConversation} size={24} />
            </div>
          </div>

          <ScrollbarContainer variant='on-hover'>
            <div className='messages-list__item-list'>
              {this.filteredConversations.map((c) => (
                <ConversationItem
                  key={c.id}
                  conversation={c}
                  filter={this.state.filter}
                  onClick={this.openExistingConversation}
                  myUserId={this.props.myUserId}
                  activeConversationId={this.props.activeConversationId}
                />
              ))}

              {this.state.userSearchResults?.length > 0 && this.state.filter !== '' && (
                <UserSearchResults
                  results={this.state.userSearchResults}
                  filter={this.state.filter}
                  onCreate={this.createNewConversation}
                />
              )}
            </div>
          </ScrollbarContainer>
        </div>
        <Button
          className={'messages-list__invite-button'}
          variant={'text'}
          onPress={this.openInviteDialog}
          startEnhancer={<IconUserPlus1 />}
        >
          Invite Friends
        </Button>
        {this.renderInviteDialog()}
      </>
    );
  }
}
