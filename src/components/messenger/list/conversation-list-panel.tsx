import * as React from 'react';

import Tooltip from '../../tooltip';
import { otherMembersToString } from '../../../platform-apps/channels/util';
import { SearchConversations } from '../search-conversations';
import { Channel } from '../../../store/channels';
import { IconMessagePlusSquare, IconMessageQuestionSquare, IconUserPlus1 } from '@zero-tech/zui/icons';
import { IconButton } from '../../icon-button';
import { ConversationItem } from './conversation-item';
import { InviteDialogContainer } from '../../invite-dialog/container';
import { Button, Modal } from '@zero-tech/zui/components';
import { Item, Option } from '../lib/types';
import { UserSearchResults } from './user-search-results';
import { conversationToOption, itemToOption } from '../lib/utils';

export interface Properties {
  conversations: Channel[];

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
      return this.setState({ filter: tempSearch, userSearchResults: null });
    }

    const oneOnOneConversations = this.props.conversations.filter((c) => c.otherMembers.length === 1);
    const oneOnOneConversationMemberIds = oneOnOneConversations.flatMap((c) => c.otherMembers.map((m) => m.userId));

    this.setState({ filter: tempSearch, userSearchResults: oneOnOneConversations.flatMap(conversationToOption) });

    const items: Item[] = await this.props.search(tempSearch);
    const filteredItems = items?.filter((item) => !oneOnOneConversationMemberIds.includes(item.id));

    this.setState({ userSearchResults: filteredItems?.map(itemToOption) });
  };

  get filteredConversations() {
    if (this.state.filter === '') {
      return this.props.conversations;
    }

    const searchRegEx = new RegExp(this.state.filter, 'i');
    return this.props.conversations.filter((conversation) =>
      searchRegEx.test(otherMembersToString(conversation.otherMembers))
    );
  }

  renderNewMessageModal = (): JSX.Element => {
    return (
      <Tooltip
        placement='left'
        overlay='Create Zero Message'
        align={{
          offset: [
            10,
            0,
          ],
        }}
      >
        <div className='header-button'>
          <span className='header-button__title'>Conversations</span>
          <span className='header-button__icon' onClick={this.props.startConversation}>
            <IconButton
              onClick={this.props.startConversation}
              Icon={IconMessagePlusSquare}
              size={18}
              className='header-button__icon-plus'
            />
          </span>
        </div>
      </Tooltip>
    );
  };

  renderNoMessages = (): JSX.Element => {
    return (
      <div className='messages-list__start'>
        <div className='messages-list__start-title'>
          <span className='messages-list__start-icon'>
            <IconMessageQuestionSquare size={34} label='You have no messages yet' />
          </span>
          You have no messages yet
        </div>
        <span className='messages-list__start-conversation' onClick={this.props.startConversation}>
          Start a Conversation
        </span>
      </div>
    );
  };

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

  render() {
    return (
      <>
        <div className='messages-list__direct-messages'>{this.renderNewMessageModal()}</div>
        <div className='messages-list__items'>
          <div className='messages-list__items-conversations-input'>
            <SearchConversations
              className='messages-list__items-conversations-search'
              placeholder='Search contacts...'
              onChange={this.searchChanged}
            />
          </div>
          <div className='messages-list__item-list'>
            {this.filteredConversations.map((c) => (
              <ConversationItem key={c.id} conversation={c} onClick={this.props.onConversationClick} />
            ))}

            {this.state.userSearchResults?.length > 0 && this.state.filter !== '' && (
              <UserSearchResults results={this.state.userSearchResults} onCreate={this.props.onCreateConversation} />
            )}
          </div>
        </div>
        {/* Note: this does not work. directMessages is never null */}
        {/* This should change to this.filteredConversations?.length === 0 */}
        {!this.props.conversations && <div className='messages-list__new-messages'>{this.renderNoMessages()}</div>}
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
