import { Switch, Route } from 'react-router-dom';

import { Feed } from './components/feed';
import { Sidekick } from './components/sidekick';
import { PostView } from './components/post-view-container';

import styles from './styles.module.scss';

export const FeedApp = () => {
  return (
    <div className={styles.Feed}>
      <Sidekick />
      <Switch>
        <Route
          path='/feed/:zid/:postId'
          component={({ match }: any) => <PostView postId={match.params.postId} isFeed={true} />}
        />
        <Route path='/feed/:zid' component={({ match }: any) => <Feed zid={match.params.zid} />} />
        <Route path='/feed' component={Feed} />
      </Switch>
    </div>
  );
};
