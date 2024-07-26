import * as React from 'react';

import { Channel, DefaultRoomLabels } from '../../../../store/channels';
import { ConversationItem } from '../conversation-item';
import { Input } from '@zero-tech/zui/components';
import { Item, Option } from '../../lib/types';
import { UserSearchResults } from '../user-search-results';
import { itemToOption } from '../../lib/utils';
import { ScrollbarContainer } from '../../../scrollbar-container';
import escapeRegExp from 'lodash/escapeRegExp';
import { getDirectMatches, getIndirectMatches } from './utils';

import { bemClassName } from '../../../../lib/bem';
import './conversation-list-panel.scss';

const cn = bemClassName('messages-list');

export interface Properties {
  conversations: Channel[];
  myUserId: string;
  activeConversationId: string;

  search: (input: string) => any;
  onCreateConversation: (userId: string) => void;
  onConversationClick: (payload: { conversationId: string }) => void;
  onAddLabel: (payload: { roomId: string; label: string }) => void;
  onRemoveLabel: (payload: { roomId: string; label: string }) => void;
}

enum Tab {
  All = 'all',
  Favorites = 'favorites',
  Work = 'work',
  Social = 'social',
  Family = 'family',
}

interface State {
  filter: string;
  userSearchResults: Option[];
  selectedTab: Tab;
}

export class ConversationListPanel extends React.Component<Properties, State> {
  scrollContainerRef: React.RefObject<ScrollbarContainer>;
  tabListRef: React.RefObject<HTMLDivElement>;
  state = { filter: '', userSearchResults: [], selectedTab: Tab.All };

  constructor(props) {
    super(props);
    this.scrollContainerRef = React.createRef();
    this.tabListRef = React.createRef();
  }

  componentDidMount() {
    if (this.tabListRef.current) {
      this.tabListRef.current.addEventListener('wheel', this.horizontalScroll, { passive: false });
    }
  }

  componentWillUnmount() {
    if (this.tabListRef.current) {
      this.tabListRef.current.removeEventListener('wheel', this.horizontalScroll);
    }
  }

  horizontalScroll = (event) => {
    if (event.deltaY !== 0) {
      event.preventDefault();
      this.tabListRef.current.scrollLeft += event.deltaY;
    }
  };

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
      const tabToConversationsMap = {
        [Tab.All]: this.props.conversations,
        [Tab.Favorites]: this.getConversationsByLabel(DefaultRoomLabels.FAVORITE),
        [Tab.Work]: this.getConversationsByLabel(DefaultRoomLabels.WORK),
        [Tab.Social]: this.getConversationsByLabel(DefaultRoomLabels.SOCIAL),
        [Tab.Family]: this.getConversationsByLabel(DefaultRoomLabels.FAMILY),
      };

      return tabToConversationsMap[this.state.selectedTab];
    }

    const searchRegEx = new RegExp(escapeRegExp(this.state.filter), 'i');
    const directMatches = getDirectMatches(this.props.conversations, searchRegEx);
    const indirectMatches = getIndirectMatches(this.props.conversations, searchRegEx);

    return [...directMatches, ...indirectMatches];
  }

  openExistingConversation = (id: string) => {
    this.props.onConversationClick({ conversationId: id });
    this.setState({ filter: '' });
  };

  createNewConversation = (userId: string) => {
    this.props.onCreateConversation(userId);
    this.setState({ filter: '' });
  };

  selectTab = (tab) => {
    this.setState({ selectedTab: tab });
  };

  onAddLabel = (roomId: string, label) => {
    this.props.onAddLabel({ roomId, label });
  };

  onRemoveLabel = (roomId: string, label) => {
    this.props.onRemoveLabel({ roomId, label });
  };

  getConversationsByLabel(label) {
    return this.props.conversations.filter((c) => c.labels?.includes(label));
  }

  getUnreadCount(conversations: Channel[]) {
    const count = conversations.reduce((acc, c) => acc + c.unreadCount, 0);
    return count < 99 ? count : '99+';
  }

  renderTab(tab, label, unreadCount) {
    return (
      <div {...cn('tab', this.state.selectedTab === tab && 'active')} onClick={() => this.selectTab(tab)}>
        {label}
        {!!unreadCount && (
          <div {...cn('tab-badge')}>
            <span>{unreadCount}</span>
          </div>
        )}
      </div>
    );
  }

  renderTabList() {
    const favorites = this.getConversationsByLabel(DefaultRoomLabels.FAVORITE);
    const work = this.getConversationsByLabel(DefaultRoomLabels.WORK);
    const social = this.getConversationsByLabel(DefaultRoomLabels.SOCIAL);
    const family = this.getConversationsByLabel(DefaultRoomLabels.FAMILY);

    return (
      <div {...cn('tab-list')} ref={this.tabListRef}>
        {this.renderTab(Tab.All, 'All', this.getUnreadCount(this.props.conversations))}
        {this.renderTab(Tab.Favorites, 'Favorites', this.getUnreadCount(favorites))}
        {this.renderTab(Tab.Work, 'Work', this.getUnreadCount(work))}
        {this.renderTab(Tab.Family, 'Family', this.getUnreadCount(family))}
        {this.renderTab(Tab.Social, 'Social', this.getUnreadCount(social))}
      </div>
    );
  }

  renderEmptyConversationList = () => {
    if (this.state.selectedTab !== Tab.All) {
      return (
        <div {...cn('label-preview')}>
          <span>{`Right click a conversation to add it to the ${this.state.selectedTab} label.`}</span>
          <div {...cn('label-preview-image')}></div>
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

          {this.renderTabList()}

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
                    onAddLabel={this.onAddLabel}
                    onRemoveLabel={this.onRemoveLabel}
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

              <div {...cn('buffer')} />
            </div>
          </ScrollbarContainer>
        </div>
      </>
    );
  }
}
