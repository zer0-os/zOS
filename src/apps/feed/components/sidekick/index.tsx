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

import styles from './styles.module.scss';

export const Sidekick = () => {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const { isErrorZids, isLoadingZids, selectedZId, zids, search, setSearch, unreadCounts, mutedChannels } =
    useSidekick();

  const handleCreateChannel = () => {
    setIsCreateModalOpen(true);
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
          <SidekickScroll>
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
          </SidekickScroll>
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
