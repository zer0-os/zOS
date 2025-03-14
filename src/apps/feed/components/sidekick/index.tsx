import { ReactNode } from 'react';
import { useHistory } from 'react-router-dom';

import { useSidekick } from './lib/useSidekick';
import { Input } from '@zero-tech/zui/components/Input/Input';
import { LoadingIndicator } from '@zero-tech/zui/components/LoadingIndicator';
import { IconSearchMd, IconBellOff1 } from '@zero-tech/zui/icons';
import {
  ContentPortal as SidekickContentPortal,
  Content as SidekickContent,
  Scroll as SidekickScroll,
} from '../../../../components/sidekick';

import classNames from 'classnames';
import styles from './styles.module.scss';
import { setLastActiveFeed } from '../../../../lib/last-feed';

export const Sidekick = () => {
  const { isErrorZids, isLoadingZids, selectedZId, zids, search, setSearch, unreadCounts, mutedChannels } =
    useSidekick();

  return (
    <SidekickContentPortal>
      <SidekickContent>
        <Input
          className={styles.Search}
          onChange={setSearch}
          size={'small'}
          startEnhancer={<IconSearchMd size={16} color={'var(--color-greyscale-11)'} />}
          type={'search'}
          value={search}
          wrapperClassName={styles.SearchWrapper}
        />
        <SidekickScroll>
          <ul className={styles.List}>
            {isLoadingZids && <LoadingIndicator />}
            {isErrorZids && <li>Error loading channels</li>}
            {zids?.map((zid) => {
              const hasUnreadHighlights = unreadCounts[zid]?.highlight > 0;
              const hasUnreadTotal = unreadCounts[zid]?.total > 0;
              const isMuted = mutedChannels[zid];
              const isUnread = hasUnreadHighlights || hasUnreadTotal;
              return (
                <FeedItem key={zid} route={`/feed/${zid}`} isSelected={selectedZId === zid} zid={zid}>
                  <div className={classNames(styles.FeedName, { [styles.Unread]: isUnread })}>
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
