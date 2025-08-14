import { useState } from 'react';

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

import styles from './styles.module.scss';

const tabsData: TabData[] = [
  {
    id: Tab.Channels,
    label: 'Channels',
    ariaLabel: 'Channels tab',
  },
  {
    id: Tab.Explore,
    label: 'Explore',
    ariaLabel: 'Explore tab',
  },
  {
    id: Tab.Airdrops,
    label: 'Airdrops',
    ariaLabel: 'Airdrops tab',
  },
];

export const Sidekick = () => {
  console.log('XXX Sidekick component re-render');

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedTab, setSelectedTab] = useState<Tab>(() => {
    const lastTab = getLastActiveChannelsTab();
    return lastTab ? (lastTab as Tab) : Tab.Channels;
  });

  const {
    isLoadingZids,
    isErrorMine,
    isErrorAll,
    selectedZId,
    usersChannels,
    allChannels,
    search,
    setSearch,
    memberCounts,
    tokenInfoMap,
  } = useSidekick();

  console.log(
    'XXX Sidekick - tokenInfoMap size:',
    tokenInfoMap.size,
    'usersChannels:',
    usersChannels?.length,
    'allChannels:',
    allChannels?.length
  );

  const handleCreateChannel = () => {
    setIsCreateModalOpen(true);
  };

  const handleTabSelect = (tab: Tab) => {
    setSelectedTab(tab);
    setLastActiveChannelsTab(tab);
  };

  const renderFeedItems = (channels: any[]) => {
    console.log('XXX renderFeedItems called with:', channels?.length, 'channels');

    return channels?.map((channel) => {
      const tokenInfo = tokenInfoMap.get(channel.zid);

      console.log('XXX FeedItem for zid:', channel.zid, 'tokenInfo:', tokenInfo);

      return (
        <FeedItem
          key={channel.zid}
          route={`/feed/${channel.zid}`}
          isSelected={selectedZId === channel.zid}
          zid={channel.zid}
          memberCount={channel.memberCount || memberCounts[channel.zid]}
          tokenSymbol={tokenInfo?.tokenSymbol}
          tokenPriceUsd={tokenInfo?.priceData?.usd}
          tokenPriceChange={tokenInfo?.priceData?.change24h}
          tokenMarketCap={tokenInfo?.priceData?.marketCap}
        />
      );
    });
  };

  const renderContent = () => {
    switch (selectedTab) {
      case Tab.Channels:
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
      case Tab.Explore:
        return (
          <ul className={styles.List}>
            {isLoadingZids && <LoadingIndicator className={styles.LoadingIndicator} />}
            {isErrorAll && <div className={styles.Error}>Error loading all channels</div>}
            {!isLoadingZids && !isErrorAll && allChannels?.length === 0 && (
              <div className={styles.EmptyState}>No channels found</div>
            )}
            {renderFeedItems(allChannels)}
          </ul>
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
