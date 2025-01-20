import { ReactNode } from 'react';
import { useHistory } from 'react-router-dom';

import { useFeedSelector } from './lib/useFeedSelector';

import { ScrollbarContainer } from '../../../../components/scrollbar-container';

import styles from './styles.module.scss';

export const FeedSelector = () => {
  const { zids, isLoadingZids, isErrorZids } = useFeedSelector();

  return (
    <ul className={styles.List}>
      <ScrollbarContainer variant='on-hover' className={styles.Scroll}>
        <FeedItem key={'everything'} route={'/feed'}>
          All
        </FeedItem>
        {isLoadingZids && <li>Loading Feeds...</li>}
        {isErrorZids && <li>Error loading Feeds</li>}
        {zids?.map((zid) => (
          <FeedItem key={zid} route={`/feed/${zid}`}>
            <span>0://</span>
            {zid}
          </FeedItem>
        ))}
      </ScrollbarContainer>
    </ul>
  );
};

const FeedItem = ({ route, children }: { route: string; children: ReactNode }) => {
  const history = useHistory();

  const handleOnClick = () => {
    history.push(route);
  };

  return (
    <li tabIndex={0} onClick={handleOnClick}>
      {children}
    </li>
  );
};
