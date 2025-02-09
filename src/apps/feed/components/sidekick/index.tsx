import { ReactNode } from 'react';
import { useHistory } from 'react-router-dom';

import { useFeedSelector } from './lib/useFeedSelector';
import { Container as SidekickContainer } from '../../../../components/sidekick/components/container';
import { UserProfileContainer } from '../../../../components/messenger/user-profile/container';
import { Header } from '../../../../components/sidekick/components/header';
import { CurrentUserDetails } from '../../../../components/sidekick/components/current-user-details';
import { ScrollbarContainer } from '../../../../components/scrollbar-container';

import styles from './styles.module.scss';

export const Sidekick = () => {
  const { isErrorZids, isLoadingZids, isProfileOpen, selectedZId, zids } = useFeedSelector();

  return (
    <SidekickContainer className={styles.Container}>
      {isProfileOpen ? (
        <UserProfileContainer />
      ) : (
        <>
          <Header>
            <CurrentUserDetails />
          </Header>
          <ScrollbarContainer variant='on-hover' className={styles.Scroll}>
            <ul className={styles.List}>
              <FeedItem key={'explore'} route={'/feed'} isSelected={selectedZId === undefined}>
                Explore
              </FeedItem>
              {isLoadingZids && <li>Loading Feeds...</li>}
              {isErrorZids && <li>Error loading Feeds</li>}
              {zids?.map((zid) => (
                <FeedItem key={zid} route={`/feed/${zid}`} isSelected={selectedZId === zid}>
                  <span>0://</span>
                  {zid}
                </FeedItem>
              ))}
            </ul>
          </ScrollbarContainer>
        </>
      )}
    </SidekickContainer>
  );
};

const FeedItem = ({ route, children, isSelected }: { route: string; children: ReactNode; isSelected?: boolean }) => {
  const history = useHistory();

  const handleOnClick = () => {
    history.push(route);
  };

  return (
    <li tabIndex={0} onClick={handleOnClick} data-is-selected={isSelected ? '' : undefined}>
      {children}
    </li>
  );
};
