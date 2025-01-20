import { ReactNode } from 'react';
import { useHistory } from 'react-router-dom';

import { useFeedSelector } from './lib/useFeedSelector';

import { ScrollbarContainer } from '../../../../components/scrollbar-container';

import styles from './styles.module.scss';

export const FeedSelector = () => {
  const { zids, isLoadingZids, isErrorZids, selectedZId } = useFeedSelector();

  return (
    <ul className={styles.List}>
      <ScrollbarContainer variant='on-hover' className={styles.Scroll}>
        <FeedItem key={'everything'} route={'/feed'} isSelected={selectedZId === undefined}>
          Everything
        </FeedItem>
        {isLoadingZids && <li>Loading Feeds...</li>}
        {isErrorZids && <li>Error loading Feeds</li>}
        {zids?.map((zid) => (
          <FeedItem key={zid} route={`/feed/${zid}`} isSelected={selectedZId === zid}>
            <span>0://</span>
            {zid}
          </FeedItem>
        ))}
      </ScrollbarContainer>
    </ul>
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
