import { useMemo, useState } from 'react';

import { useSidekick } from './lib/useSidekick';
import { Input } from '@zero-tech/zui/components/Input/Input';
import { LoadingIndicator } from '@zero-tech/zui/components/LoadingIndicator';
import { IconSearchMd, IconPlus } from '@zero-tech/zui/icons';
import {
  ContentPortal as SidekickContentPortal,
  Content as SidekickContent,
  Scroll as SidekickScroll,
} from '../../../../components/sidekick';
import { IconButton } from '@zero-tech/zui/components';
import { featureFlags } from '../../../../lib/feature-flags';
import { CreateChannelModal } from '../create-channel';
import { TabList, Tab, TabData } from './components/tab-list';
import { getLastActiveChannelsTab, setLastActiveChannelsTab } from '../../../../lib/last-channels-tab';
import { FeedItem } from './components/feed-item';
import { useDispatch, useSelector } from 'react-redux';
import { allChannelsSelector } from '../../../../store/channels/selectors';
import { DefaultRoomLabels, onAddLabel, onRemoveLabel, openConversation } from '../../../../store/channels';
import { ConversationItem } from '../../../../components/messenger/list/conversation-item';
import { userIdSelector } from '../../../../store/authentication/selectors';
import { usersMapSelector } from '../../../../store/users/selectors';
import { createSelector } from '@reduxjs/toolkit';
import { activeConversationIdSelector } from '../../../../store/chat/selectors';

import styles from './styles.module.scss';

const tabsData: TabData[] = [
  {
    id: Tab.Channels,
    label: 'Channels',
    ariaLabel: 'Channels tab',
  },
  {
    id: Tab.Gated,
    label: 'Gated',
    ariaLabel: 'Gated tab',
  },
  {
    id: Tab.Muted,
    label: 'Muted',
    ariaLabel: 'Muted tab',
  },
];

const selectGetUser = createSelector(usersMapSelector, (users: Record<string, any>) => (id: string) => users[id]);

export const Sidekick = ({ initialTab }: { initialTab?: Tab } = {}) => {
  const dispatch = useDispatch();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedTab, setSelectedTab] = useState<Tab>(() => {
    if (initialTab) return initialTab;
    const lastTab = getLastActiveChannelsTab();
    return (lastTab as Tab) || Tab.Channels;
  });

  const { isLoadingZids, isErrorMine, selectedZId, usersChannels, search, setSearch, memberCounts, tokenInfoMap } =
    useSidekick();

  const conversations = useSelector(allChannelsSelector);
  const currentUserId = useSelector(userIdSelector);
  const activeConversationId = useSelector(activeConversationIdSelector);
  const getUser = useSelector(selectGetUser);

  const unencryptedGroups = useMemo(
    () =>
      conversations
        ?.filter(
          (c) =>
            !c.isSocialChannel &&
            c.isEncrypted === false &&
            !c.labels?.includes(DefaultRoomLabels.ARCHIVED) &&
            !c.labels?.includes(DefaultRoomLabels.MUTE)
        )
        .sort((a, b) => b.bumpStamp - a.bumpStamp),
    [conversations]
  );

  const mutedGroups = useMemo(
    () =>
      conversations
        ?.filter((c) => c.labels?.includes(DefaultRoomLabels.MUTE))
        .sort((a, b) => b.bumpStamp - a.bumpStamp),
    [conversations]
  );

  // Apply search filter to unencrypted groups (Channels tab)
  const filteredUnencryptedGroups = useMemo(() => {
    const list = unencryptedGroups || [];
    const query = search.toLowerCase();
    if (!query.trim()) return list;
    return list.filter(
      (c) => (c.name ?? '').toLowerCase().includes(query) || (c.zid ?? '').toLowerCase().includes(query)
    );
  }, [unencryptedGroups, search]);

  const filteredMutedGroups = useMemo(() => {
    const list = mutedGroups || [];
    const query = search.toLowerCase();
    if (!query.trim()) return list;
    return list.filter(
      (c) => (c.name ?? '').toLowerCase().includes(query) || (c.zid ?? '').toLowerCase().includes(query)
    );
  }, [mutedGroups, search]);

  const openConversationHandler = (conversationId: string) => {
    dispatch(openConversation({ conversationId }));
  };

  const addLabelHandler = (roomId: string, label: string) => {
    dispatch(onAddLabel({ roomId, label }));
  };

  const removeLabelHandler = (roomId: string, label: string) => {
    dispatch(onRemoveLabel({ roomId, label }));
  };

  const handleCreateChannel = () => {
    setIsCreateModalOpen(true);
  };

  const handleTabSelect = (tab: Tab) => {
    setSelectedTab(tab);
    setLastActiveChannelsTab(tab);
  };

  const renderFeedItems = (channels: any[]) => {
    return channels?.map((channel) => {
      const tokenInfo = tokenInfoMap.get(channel.zid);

      return (
        <FeedItem
          key={channel.zid}
          route={`/feed/${channel.zid}`}
          isSelected={selectedZId === channel.zid}
          zid={channel.zid}
          memberCount={channel.memberCount || memberCounts[channel.zid]}
          tokenMarketCap={tokenInfo?.priceData.marketCap}
        />
      );
    });
  };

  const renderContent = () => {
    switch (selectedTab) {
      case Tab.Gated:
        return (
          <ul className={styles.List}>
            {isLoadingZids && <LoadingIndicator className={styles.LoadingIndicator} />}
            {isErrorMine && <div className={styles.Error}>Error loading all channels</div>}
            {!isLoadingZids && !isErrorMine && usersChannels?.length === 0 && (
              <div className={styles.EmptyState}>No channels found</div>
            )}
            {renderFeedItems(usersChannels)}
          </ul>
        );
      case Tab.Channels:
        return (
          <div className={styles.ConversationList}>
            {filteredUnencryptedGroups?.length === 0 && <div className={styles.EmptyState}>No channels found</div>}
            {filteredUnencryptedGroups?.map((conversation) => (
              <ConversationItem
                key={conversation.id}
                conversation={conversation}
                filter=''
                onClick={openConversationHandler}
                currentUserId={currentUserId}
                getUser={getUser}
                activeConversationId={activeConversationId}
                onAddLabel={addLabelHandler}
                onRemoveLabel={removeLabelHandler}
                isCollapsed={false}
              />
            ))}
          </div>
        );
      case Tab.Muted:
        return (
          <div className={styles.ConversationList}>
            {filteredMutedGroups?.length === 0 && <div className={styles.EmptyState}>No channels found</div>}
            {filteredMutedGroups?.map((conversation) => (
              <ConversationItem
                key={conversation.id}
                conversation={conversation}
                filter=''
                onClick={openConversationHandler}
                currentUserId={currentUserId}
                getUser={getUser}
                activeConversationId={activeConversationId}
                onAddLabel={addLabelHandler}
                onRemoveLabel={removeLabelHandler}
                isCollapsed={false}
              />
            ))}
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <>
      {featureFlags.enableCreateTGCChannel && (
        <CreateChannelModal open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen} />
      )}
      <SidekickContentPortal>
        <SidekickContent>
          <div className={styles.Actions}>
            <Input
              className={styles.Search}
              onChange={setSearch}
              size={'small'}
              startEnhancer={<IconSearchMd size={16} color={'var(--color-greyscale-11)'} />}
              type={'search'}
              value={search}
              wrapperClassName={styles.SearchWrapper}
            />
            <div className={styles.CreateChannelButton}>
              {featureFlags.enableCreateTGCChannel && (
                <IconButton Icon={IconPlus} onClick={handleCreateChannel} aria-label='Create new channel' />
              )}
            </div>
          </div>

          <TabList selectedTab={selectedTab} onTabSelect={handleTabSelect} tabsData={tabsData} />

          <SidekickScroll>{renderContent()}</SidekickScroll>
        </SidekickContent>
      </SidekickContentPortal>
    </>
  );
};
