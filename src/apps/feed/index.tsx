import { Switch, Route } from 'react-router-dom';

import { Feed } from './components/feed';
import { FeedSelector } from './components/feed-selector';
import { PostView } from './components/post-view-container';
import { ScrollbarContainer } from '../../components/scrollbar-container';

import styles from './styles.module.scss';

export const FeedApp = () => {
  return (
    <div className={styles.Feed}>
      <FeedSelector />
      <ScrollbarContainer className={styles.Scroll} variant='on-hover'>
        <Switch>
          <Route
            path='/feed/:zid/:postId'
            component={({ match }: any) => <PostView postId={match.params.postId} isFeed={true} />}
          />
          <Route path='/feed/:zid' component={({ match }: any) => <Feed zid={match.params.zid} />} />
          <Route path='/feed' component={Feed} />
        </Switch>
      </ScrollbarContainer>
    </div>
  );
};
