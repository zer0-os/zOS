import { ReactNode } from 'react';
import { useHistory } from 'react-router-dom';

import { useSidekick } from './lib/useSidekick';
import { Container as SidekickContainer } from '../../../../components/sidekick/components/container';
import { UserProfileContainer } from '../../../../components/messenger/user-profile/container';
import { Header } from '../../../../components/sidekick/components/header';
import { CurrentUserDetails } from '../../../../components/sidekick/components/current-user-details';
import { ScrollbarContainer } from '../../../../components/scrollbar-container';
import { Input } from '@zero-tech/zui/components/Input/Input';
import { IconSearchMd } from '@zero-tech/zui/icons';
import { Panel, PanelBody } from '../../../../components/layout/panel';

import styles from './styles.module.scss';

export const Sidekick = () => {
  const { isErrorZids, isLoadingZids, isProfileOpen, selectedZId, zids, search, setSearch } = useSidekick();

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
    <li tabIndex={0} onClick={handleOnClick} data-is-selected={isSelected ? '' : undefined}>
      {children}
    </li>
  );
};
