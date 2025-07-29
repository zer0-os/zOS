import { useState, ReactNode } from 'react';
import { useHistory } from 'react-router-dom';

import { useSidekick } from './lib/useSidekick';
import { Input } from '@zero-tech/zui/components/Input/Input';
import { LoadingIndicator } from '@zero-tech/zui/components/LoadingIndicator';
import { IconSearchMd, IconBellOff1, IconPlus } from '@zero-tech/zui/icons';
import {
  ContentPortal as SidekickContentPortal,
  Content as SidekickContent,
  Scroll as SidekickScroll,
} from '../../../../components/sidekick';
import { setLastActiveFeed } from '../../../../lib/last-feed';
import { IconButton } from '@zero-tech/zui/components';
import { featureFlags } from '../../../../lib/feature-flags';
import { CreateChannelModal } from '../create-channel';
import { TabList, Tab, TabData } from './components/tab-list';
import { getLastActiveChannelsTab, setLastActiveChannelsTab } from '../../../../lib/last-channels-tab';
import { calculateChannelsTabUnreadCount } from './lib/utils';

import styles from './styles.module.scss';

export const Sidekick = () => {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedTab, setSelectedTab] = useState<Tab>(() => {
    const lastTab = getLastActiveChannelsTab();
    return lastTab ? (lastTab as Tab) : Tab.Channels;
  });

  const { isErrorZids, isLoadingZids, selectedZId, zids, search, setSearch, unreadCounts, mutedChannels } =
    useSidekick();

  const handleCreateChannel = () => {
    setIsCreateModalOpen(true);
  };

  const handleTabSelect = (tab: Tab) => {
    setSelectedTab(tab);
    setLastActiveChannelsTab(tab);
  };

  // Calculate total unread count for Channels tab
  const channelsUnreadCount = calculateChannelsTabUnreadCount(unreadCounts, zids);

  const tabsData: TabData[] = [
    {
      id: Tab.Channels,
      label: 'Channels',
      unreadCount: channelsUnreadCount,
      ariaLabel: 'Channels tab',
    },
    {
      id: Tab.Explore,
      label: 'Explore',
      unreadCount: 0,
      ariaLabel: 'Explore tab',
    },
    {
      id: Tab.Airdrops,
      label: 'Airdrops',
      unreadCount: 0,
      ariaLabel: 'Airdrops tab',
    },
  ];

  const renderContent = () => {
    switch (selectedTab) {
      case Tab.Channels:
        return (
          <ul className={styles.List}>
            {isLoadingZids && <LoadingIndicator />}
            {isErrorZids && <li>Error loading channels</li>}
            {zids?.map((zid) => {
              const hasUnreadHighlights = unreadCounts[zid]?.highlight > 0;
              const hasUnreadTotal = unreadCounts[zid]?.total > 0;
              const isMuted = mutedChannels[zid];
              return (
                <FeedItem key={zid} route={`/feed/${zid}`} isSelected={selectedZId === zid} zid={zid}>
                  <div className={styles.FeedName}>
                    <span>0://</span>
                    <div>{zid}</div>
                  </div>

                  <div className={styles.ItemIcons}>
                    {isMuted && <IconBellOff1 className={styles.MutedIcon} size={16} />}
                    {!hasUnreadHighlights && hasUnreadTotal && (
                      <div className={styles.UnreadCount}>{unreadCounts[zid]?.total}</div>
                    )}
                    {hasUnreadHighlights && (
                      <div className={styles.UnreadHighlight}>{unreadCounts[zid]?.highlight}</div>
                    )}
                  </div>
                </FeedItem>
              );
            })}
          </ul>
        );
      case Tab.Explore:
        return (
          <div className={styles.EmptyState}>
            <span>Explore channels coming soon</span>
          </div>
        );
      case Tab.Airdrops:
        return (
          <div className={styles.EmptyState}>
            <span>Airdrops coming soon</span>
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

const FeedItem = ({
  route,
  children,
  isSelected,
  zid,
}: {
  route: string;
  children: ReactNode;
  isSelected?: boolean;
  zid: string;
}) => {
  const history = useHistory();

  const handleOnClick = () => {
    setLastActiveFeed(zid);
    history.push(route);
  };

  return (
    <li className={styles.FeedItem} tabIndex={0} onClick={handleOnClick} data-is-selected={isSelected ? '' : undefined}>
      {children}
    </li>
  );
};
