import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';

import {
  DefaultRoomLabels,
  NormalizedChannel,
  onAddLabel,
  onRemoveLabel,
  openConversation,
  User,
} from '../../../../store/channels';
import { ConversationItem } from '../conversation-item';
import { Input } from '@zero-tech/zui/components';
import { Option } from '../../lib/types';
import { UserSearchResults } from '../user-search-results';
import { itemToOption } from '../../lib/utils';
import { ScrollbarContainer } from '../../../scrollbar-container';
import escapeRegExp from 'lodash/escapeRegExp';
import { getDirectMatches, getIndirectMatches } from './utils';
import { IconStar1 } from '@zero-tech/zui/icons';
import { getLastActiveTab, setLastActiveTab } from '../../../../lib/last-tab';
import { useDispatch, useSelector } from 'react-redux';
import { createSelector } from '@reduxjs/toolkit';
import { Waypoint } from '../../../waypoint';

import { bemClassName } from '../../../../lib/bem';
import './conversation-list-panel.scss';
import { Spinner } from '@zero-tech/zui/components/LoadingIndicator';
import { isOneOnOne } from '../../../../store/channels-list/utils';
import { allChannelsSelector } from '../../../../store/channels/selectors';
import { CreateConversationButton } from '../create-conversation-button/create-conversation-button';
import { userIdSelector } from '../../../../store/authentication/selectors';
import { usersMapSelector } from '../../../../store/users/selectors';
import { MemberNetworks } from '../../../../store/users/types';

const cn = bemClassName('messages-list');

const PAGE_SIZE = 20;

export enum Tab {
  All = 'all',
  Favorites = 'favorites',
  Work = 'work',
  Social = 'social',
  Family = 'family',
  Archived = 'archived',
}

const tabLabelMap = {
  [Tab.All]: Tab.All,
  [Tab.Favorites]: DefaultRoomLabels.FAVORITE,
  [Tab.Work]: DefaultRoomLabels.WORK,
  [Tab.Social]: DefaultRoomLabels.SOCIAL,
  [Tab.Family]: DefaultRoomLabels.FAMILY,
  [Tab.Archived]: DefaultRoomLabels.ARCHIVED,
  [DefaultRoomLabels.FAVORITE]: Tab.Favorites,
  [DefaultRoomLabels.WORK]: Tab.Work,
  [DefaultRoomLabels.SOCIAL]: Tab.Social,
  [DefaultRoomLabels.FAMILY]: Tab.Family,
  [DefaultRoomLabels.ARCHIVED]: Tab.Archived,
};

export interface Properties {
  currentUserId: string;
  activeConversationId: string;
  isLabelDataLoaded: boolean;
  isCollapsed: boolean;

  search: (input: string) => Promise<MemberNetworks[]>;
  onCreateConversation: (userId: string) => void;
}

const selectGetUser = createSelector(usersMapSelector, (users: Record<string, User>) => (id: string) => users[id]);

export const ConversationListPanel: React.FC<Properties> = React.memo((props) => {
  const { activeConversationId, isLabelDataLoaded, isCollapsed, search, onCreateConversation } = props;

  const dispatch = useDispatch();
  const conversations = useSelector(allChannelsSelector);
  const getUser = useSelector(selectGetUser);
  const currentUserId = useSelector(userIdSelector);

  const [filter, setFilter] = useState('');
  const [userSearchResults, setUserSearchResults] = useState<Option[]>([]);
  const [selectedTab, setSelectedTab] = useState<Tab>(() => (getLastActiveTab() as Tab) || Tab.All);
  const [visibleItemCount, setVisibleItemCount] = useState(PAGE_SIZE);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  const scrollContainerRef = useRef<ScrollbarContainer>(null);
  const tabListRef = useRef<HTMLDivElement>(null);

  const scrollToTop = useCallback(() => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollToTop();
    }
  }, []);

  useEffect(() => {
    const lastActiveTab = getLastActiveTab();
    if (lastActiveTab) {
      if (selectedTab !== (lastActiveTab as Tab)) {
        setSelectedTab(lastActiveTab as Tab);
      }
    } else if (isLabelDataLoaded) {
      const favoriteConversations = conversations.filter(
        (c) => c.labels?.includes(DefaultRoomLabels.FAVORITE) && !c.labels?.includes(DefaultRoomLabels.ARCHIVED)
      );
      const newSelectedTab = favoriteConversations.length > 0 ? Tab.Favorites : Tab.All;
      if (selectedTab !== newSelectedTab) {
        setSelectedTab(newSelectedTab);
      }
    }
  }, [isLabelDataLoaded, conversations, selectedTab]);

  useEffect(() => {
    setVisibleItemCount(PAGE_SIZE);
    scrollToTop();
  }, [selectedTab, scrollToTop]);

  const horizontalScroll = useCallback((event: WheelEvent) => {
    if (tabListRef.current && event.deltaY !== 0) {
      event.preventDefault();
      tabListRef.current.scrollLeft += event.deltaY;
    }
  }, []);

  useEffect(() => {
    const currentTabListRef = tabListRef.current;
    if (currentTabListRef) {
      currentTabListRef.addEventListener('wheel', horizontalScroll, { passive: false });
      return () => {
        currentTabListRef.removeEventListener('wheel', horizontalScroll);
      };
    }
  }, [horizontalScroll]);

  const getConversationsByLabel = useCallback((label: string, conversation: NormalizedChannel) => {
    const isLabelMatch = conversation.labels?.includes(label);
    const isArchived = conversation.labels?.includes(DefaultRoomLabels.ARCHIVED);
    if (label === Tab.All) {
      return !isArchived;
    }
    if (label === DefaultRoomLabels.ARCHIVED) {
      return isArchived;
    }
    return isLabelMatch && !isArchived;
  }, []);

  const filteredConversations = useMemo(() => {
    if (!filter) {
      return conversations.filter((conversation: NormalizedChannel) => {
        const render =
          !conversation.isSocialChannel &&
          (conversation.isEncrypted ?? true) &&
          'bumpStamp' in conversation &&
          !conversation.labels?.includes(DefaultRoomLabels.MUTE);
        const labelMatch = getConversationsByLabel(tabLabelMap[selectedTab], conversation);
        return render && labelMatch;
      });
    }

    const archivedOrMutedConversationIds = conversations
      .filter((c) => c.labels?.some((l) => l === DefaultRoomLabels.ARCHIVED || l === DefaultRoomLabels.MUTE))
      .map((c) => c.id);

    const searchRegEx = new RegExp(escapeRegExp(filter), 'i');
    const directMatches = getDirectMatches(conversations, searchRegEx);
    const indirectMatches = getIndirectMatches(conversations, searchRegEx);

    return [...directMatches, ...indirectMatches].filter((c) => !archivedOrMutedConversationIds.includes(c.id));
  }, [
    conversations,
    filter,
    getConversationsByLabel,
    selectedTab,
  ]);

  const loadMoreItems = useCallback(() => {
    const totalItems = filteredConversations.length;
    if (visibleItemCount >= totalItems || isLoadingMore) return;

    setIsLoadingMore(true);
    requestAnimationFrame(() => {
      setVisibleItemCount((currentVisibleCount) => Math.min(currentVisibleCount + PAGE_SIZE, totalItems));
      setIsLoadingMore(false);
    });
  }, [filteredConversations, visibleItemCount, isLoadingMore]);

  const searchChanged = useCallback(
    async (newSearch: string) => {
      if (!newSearch) {
        scrollToTop();
        setFilter('');
        setUserSearchResults([]);
        return;
      }

      setFilter(newSearch);

      const oneOnOneConversations = conversations.filter((c) => isOneOnOne(c));
      const oneOnOneConversationMemberIds = oneOnOneConversations.flatMap((c) => c.otherMembers);

      const items: MemberNetworks[] = await search(newSearch);
      const filteredUserItems = items?.filter((item) => !oneOnOneConversationMemberIds.includes(item.id) && item.id);

      scrollToTop();
      setUserSearchResults(filteredUserItems?.map(itemToOption) || []);
    },
    [search, conversations, scrollToTop]
  );

  const openExistingConversation = useCallback(
    (id: string) => {
      dispatch(openConversation({ conversationId: id }));
      setFilter('');
      setUserSearchResults([]);
    },
    [dispatch]
  );

  const createNewConversation = useCallback(
    (userId: string) => {
      onCreateConversation(userId);
      setFilter('');
      setUserSearchResults([]);
    },
    [onCreateConversation]
  );

  const selectTabCallback = useCallback((tab: Tab) => {
    setSelectedTab(tab);
    setLastActiveTab(tab);
  }, []);

  const onAddLabelCallback = useCallback(
    (roomId: string, label: string) => {
      dispatch(onAddLabel({ roomId, label }));
    },
    [dispatch]
  );

  const onRemoveLabelCallback = useCallback(
    (roomId: string, label: string) => {
      dispatch(onRemoveLabel({ roomId, label }));
    },
    [dispatch]
  );

  const tabUnreadCount = useMemo(() => {
    return conversations
      .filter((c) => !c.isSocialChannel && !c.labels?.includes(DefaultRoomLabels.ARCHIVED))
      .reduce<Record<string, number>>(
        (acc, c) => {
          acc[Tab.All] += c.unreadCount.total;
          for (const label of c.labels) {
            if (Object.values(DefaultRoomLabels).some((l) => l === label)) {
              acc[tabLabelMap[label]] += c.unreadCount.total;
            }
          }
          return acc;
        },
        { [Tab.Favorites]: 0, [Tab.All]: 0, [Tab.Work]: 0, [Tab.Family]: 0, [Tab.Social]: 0 }
      );
  }, [conversations]);

  const renderTabList = () => {
    const tabsData = [
      {
        id: Tab.Favorites,
        label: <IconStar1 size={18} />,
        unreadCount: tabUnreadCount[Tab.Favorites],
        ariaLabel: 'Favorites tab',
      },
      { id: Tab.All, label: 'All', unreadCount: tabUnreadCount[Tab.All], ariaLabel: 'All tab' },
      { id: Tab.Work, label: 'Work', unreadCount: tabUnreadCount[Tab.Work], ariaLabel: 'Work tab' },
      { id: Tab.Family, label: 'Family', unreadCount: tabUnreadCount[Tab.Family], ariaLabel: 'Family tab' },
      { id: Tab.Social, label: 'Social', unreadCount: tabUnreadCount[Tab.Social], ariaLabel: 'Social tab' },
      { id: Tab.Archived, label: 'Archived', unreadCount: 0, ariaLabel: 'Archived tab' },
    ];

    return (
      <div {...cn('tab-list')} ref={tabListRef}>
        {tabsData.map((tab) => (
          <div
            key={tab.id}
            {...cn('tab', selectedTab === tab.id && 'active')}
            onClick={() => selectTabCallback(tab.id)}
            aria-label={tab.ariaLabel}
            role='tab'
            aria-selected={selectedTab === tab.id}
          >
            {tab.label}
            {!!tab.unreadCount && (
              <div {...cn('tab-badge')}>
                <span>{tab.unreadCount > 99 ? '99+' : tab.unreadCount}</span>
              </div>
            )}
          </div>
        ))}
      </div>
    );
  };

  const renderEmptyConversationList = () => {
    if (selectedTab !== Tab.All) {
      return (
        <div {...cn('label-preview')}>
          <span>{`Right click a conversation to add it to the ${selectedTab} label.`}</span>
          <div {...cn('label-preview-image')}></div>
        </div>
      );
    }
    return null;
  };

  const isExpanded = !isCollapsed;
  const visibleConversationsToRender = filteredConversations.slice(0, visibleItemCount);
  const hasMoreItems = visibleConversationsToRender.length < filteredConversations.length;

  return (
    <>
      <div {...cn('items')}>
        {isExpanded && (
          <div {...cn('items-actions')}>
            <Input
              {...cn('items-conversations-search')}
              onChange={searchChanged}
              size={'small'}
              type={'search'}
              value={filter}
            />
            <CreateConversationButton />
          </div>
        )}

        {isExpanded && renderTabList()}

        <ScrollbarContainer variant='on-hover' ref={scrollContainerRef}>
          <div {...cn('item-list')}>
            {visibleConversationsToRender.length > 0 &&
              visibleConversationsToRender.map((c) => (
                <ConversationItem
                  key={c.id}
                  conversation={c}
                  filter={filter}
                  onClick={openExistingConversation}
                  currentUserId={currentUserId}
                  getUser={getUser}
                  activeConversationId={activeConversationId}
                  onAddLabel={onAddLabelCallback}
                  onRemoveLabel={onRemoveLabelCallback}
                  isCollapsed={isCollapsed}
                />
              ))}

            {hasMoreItems && (
              <div {...cn('waypoint-container')}>
                <Waypoint onEnter={loadMoreItems} bottomOffset='-60px' />
              </div>
            )}

            {isLoadingMore && (
              <div {...cn('loading-more')}>
                <Spinner />
              </div>
            )}

            {isExpanded && filteredConversations.length === 0 && !filter && renderEmptyConversationList()}

            {filteredConversations?.length === 0 && userSearchResults?.length === 0 && filter !== '' && (
              <div {...cn('empty')}>{`No results for '${filter}' `}</div>
            )}

            {userSearchResults?.length > 0 && filter !== '' && (
              <UserSearchResults results={userSearchResults} filter={filter} onCreate={createNewConversation} />
            )}
            <div {...cn('buffer')} />
          </div>
        </ScrollbarContainer>
      </div>
    </>
  );
});
