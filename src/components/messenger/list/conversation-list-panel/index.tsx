import * as React from 'react';

import { Channel } from '../../../../store/channels';
import { IconUserPlus1 } from '@zero-tech/zui/icons';
import { ConversationItem } from '../conversation-item';
import { InviteDialogContainer } from '../../../invite-dialog/container';
import { Button, Input, Modal } from '@zero-tech/zui/components';
import { Item, Option } from '../../lib/types';
import { UserSearchResults } from '../user-search-results';
import { itemToOption } from '../../lib/utils';
import { ScrollbarContainer } from '../../../scrollbar-container';
import escapeRegExp from 'lodash/escapeRegExp';
import { getDirectMatches, getIndirectMatches } from './utils';

import { bemClassName } from '../../../../lib/bem';
import './conversation-list-panel.scss';
import { FeatureFlag } from '../../../feature-flag';

const cn = bemClassName('messages-list');

export interface Properties {
  conversations: Channel[];
  myUserId: string;
  activeConversationId: string;

  search: (input: string) => any;
  onCreateConversation: (userId: string) => void;
  onConversationClick: (payload: { conversationId: string }) => void;
  onFavoriteRoom: (payload: { roomId: string }) => void;
  onUnfavoriteRoom: (payload: { roomId: string }) => void;
}

enum Tab {
  All = 'all',
  Favorites = 'favorites',
}

interface State {
  filter: string;
  inviteDialogOpen: boolean;
  userSearchResults: Option[];
  selectedTab: Tab;
}

export class ConversationListPanel extends React.Component<Properties, State> {
  scrollContainerRef: React.RefObject<ScrollbarContainer>;
  state = { filter: '', inviteDialogOpen: false, userSearchResults: [], selectedTab: Tab.All };

  constructor(props) {
    super(props);
    this.scrollContainerRef = React.createRef();
  }

  scrollToTop = () => {
    if (this.scrollContainerRef.current) {
      this.scrollContainerRef.current.scrollToTop();
    }
  };

  searchChanged = async (search: string) => {
    const tempSearch = search;

    if (!tempSearch) {
      this.scrollToTop();
      return this.setState({ filter: tempSearch, userSearchResults: [] });
    }

    this.setState({ filter: tempSearch });

    const oneOnOneConversations = this.props.conversations.filter((c) => c.isOneOnOne);
    const oneOnOneConversationMemberIds = oneOnOneConversations.flatMap((c) => c.otherMembers.map((m) => m.userId));

    const items: Item[] = await this.props.search(tempSearch);
    const filteredItems = items?.filter((item) => !oneOnOneConversationMemberIds.includes(item.id) && item.id);

    this.scrollToTop();
    this.setState({ userSearchResults: filteredItems?.map(itemToOption) });
  };

  get filteredConversations() {
    if (!this.state.filter) {
      if (this.state.selectedTab === Tab.All) {
        return this.props.conversations;
      } else {
        return this.favoriteConversations;
      }
    }

    const searchRegEx = new RegExp(escapeRegExp(this.state.filter), 'i');
    const directMatches = getDirectMatches(this.props.conversations, searchRegEx);
    const indirectMatches = getIndirectMatches(this.props.conversations, searchRegEx);

    return [...directMatches, ...indirectMatches];
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
    this.props.onConversationClick({ conversationId: id });
    this.setState({ filter: '' });
  };

  createNewConversation = (userId: string) => {
    this.props.onCreateConversation(userId);
    this.setState({ filter: '' });
  };

  selectAll = () => {
    this.setState({ selectedTab: Tab.All });
  };

  selectFavorites = () => {
    this.setState({ selectedTab: Tab.Favorites });
  };

  onFavoriteRoom = (roomId: string) => {
    this.props.onFavoriteRoom({ roomId });
  };

  onUnfavoriteRoom = (roomId: string) => {
    this.props.onUnfavoriteRoom({ roomId });
  };

  get favoriteConversations() {
    return this.props.conversations.filter((c) => c.isFavorite);
  }

  get allUnreadCount() {
    const count = this.props.conversations.reduce((acc, c) => acc + c.unreadCount, 0);
    return count < 99 ? count : '99+';
  }

  get favoritesUnreadCount() {
    const count = this.favoriteConversations.reduce((acc, c) => acc + c.unreadCount, 0);
    return count < 99 ? count : '99+';
  }

  renderEmptyConversationList = () => {
    if (this.state.selectedTab === Tab.Favorites) {
      return (
        <div {...cn('favorites-preview')}>
          <span>Right click a conversation to add it to your favorites.</span>
          <div {...cn('favorites-preview-image')}></div>
        </div>
      );
    }
    return null;
  };

  render() {
    return (
      <>
        <div {...cn('items')}>
          <div {...cn('items-actions')}>
            <Input
              {...cn('items-conversations-search')}
              onChange={this.searchChanged}
              size={'small'}
              type={'search'}
              value={this.state.filter}
            />
          </div>

          <FeatureFlag featureFlag='enableFavorites'>
            <div {...cn('tab-list')}>
              <div {...cn('tab', this.state.selectedTab === Tab.All && 'active')} onClick={this.selectAll}>
                All
                {!!this.allUnreadCount && (
                  <div {...cn('tab-badge')}>
                    <span>{this.allUnreadCount}</span>
                  </div>
                )}
              </div>
              <div {...cn('tab', this.state.selectedTab === Tab.Favorites && 'active')} onClick={this.selectFavorites}>
                Favorites
                {!!this.favoritesUnreadCount && (
                  <div {...cn('tab-badge')}>
                    <span>{this.favoritesUnreadCount}</span>
                  </div>
                )}
              </div>
            </div>
          </FeatureFlag>

          <ScrollbarContainer variant='on-hover' ref={this.scrollContainerRef}>
            <div {...cn('item-list')}>
              {this.filteredConversations.length > 0 &&
                this.filteredConversations.map((c) => (
                  <ConversationItem
                    key={c.id}
                    conversation={c}
                    filter={this.state.filter}
                    onClick={this.openExistingConversation}
                    myUserId={this.props.myUserId}
                    activeConversationId={this.props.activeConversationId}
                    onFavoriteRoom={this.onFavoriteRoom}
                    onUnfavoriteRoom={this.onUnfavoriteRoom}
                  />
                ))}
              {this.filteredConversations.length === 0 && !this.state.filter && this.renderEmptyConversationList()}

              {this.filteredConversations?.length === 0 &&
                this.state.userSearchResults?.length === 0 &&
                this.state.filter !== '' && <div {...cn('empty')}>{`No results for '${this.state.filter}' `}</div>}

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
          {...cn('invite-button')}
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
