import { ReactNode } from 'react';
import { useHistory } from 'react-router-dom';

import { useSidekick } from './lib/useSidekick';
import { Container as SidekickContainer } from '../../../../components/sidekick/components/container';
import { UserProfileContainer } from '../../../../components/messenger/user-profile/container';
import { Header } from '../../../../components/sidekick/components/header';
import { CurrentUserDetails } from '../../../../components/sidekick/components/current-user-details';
import { ScrollbarContainer } from '../../../../components/scrollbar-container';
import { Input } from '@zero-tech/zui/components/Input/Input';
import { LoadingIndicator } from '@zero-tech/zui/components/LoadingIndicator';
import { IconSearchMd } from '@zero-tech/zui/icons';
import { Panel, PanelBody } from '../../../../components/layout/panel';

import styles from './styles.module.scss';

export const Sidekick = () => {
  const { isErrorZids, isLoadingZids, isProfileOpen, selectedZId, zids, search, setSearch, unreadCounts } =
    useSidekick();

  return (
    <SidekickContainer className={styles.Container}>
      <Panel className={styles.Panel}>
        <PanelBody className={styles.Body}>
          {isProfileOpen ? (
            <UserProfileContainer />
          ) : (
            <>
              <Header>
                <CurrentUserDetails />
              </Header>
              <div className={styles.Sidekick}>
                <Input
                  className={styles.Search}
                  onChange={setSearch}
                  size={'small'}
                  startEnhancer={<IconSearchMd size={16} color={'var(--color-greyscale-11)'} />}
                  type={'search'}
                  value={search}
                  wrapperClassName={styles.SearchWrapper}
                />
                <ScrollbarContainer variant='on-hover' className={styles.Scroll}>
                  <ul className={styles.List}>
                    {isLoadingZids && <LoadingIndicator />}
                    {isErrorZids && <li>Error loading channels</li>}
                    {zids?.map((zid) => {
                      const hasUnreadHighlights = unreadCounts[zid]?.highlight > 0;
                      const hasUnreadTotal = unreadCounts[zid]?.total > 0;

                      return (
                        <FeedItem key={zid} route={`/feed/${zid}`} isSelected={selectedZId === zid}>
                          <div className={styles.FeedName}>
                            <span>0://</span>
                            <div>{zid}</div>
                          </div>
                          {!hasUnreadHighlights && hasUnreadTotal && (
                            <div className={styles.UnreadCount}>{unreadCounts[zid]?.total}</div>
                          )}
                          {hasUnreadHighlights && (
                            <div className={styles.UnreadHighlight}>{unreadCounts[zid]?.highlight}</div>
                          )}
                        </FeedItem>
                      );
                    })}
                  </ul>
                </ScrollbarContainer>
              </div>
            </>
          )}
        </PanelBody>
      </Panel>
    </SidekickContainer>
  );
};

const FeedItem = ({ route, children, isSelected }: { route: string; children: ReactNode; isSelected?: boolean }) => {
  const history = useHistory();

  const handleOnClick = () => {
    history.push(route);
  };

  return (
    <li className={styles.FeedItem} tabIndex={0} onClick={handleOnClick} data-is-selected={isSelected ? '' : undefined}>
      {children}
    </li>
  );
};
