import { Switch, Route, useRouteMatch } from 'react-router-dom';

import { Feed } from './components/feed';
import { Sidekick } from './components/sidekick';
import { PostView } from './components/post-view-container';

import styles from './styles.module.scss';
import { useDispatch } from 'react-redux';
import { useEffect } from 'react';
import { validateFeedChat } from '../../store/chat';
import { config } from '../../config';

export const FeedApp = () => {
  const dispatch = useDispatch();
  const match = useRouteMatch<{ zid: string }>('/feed/:zid');

  useEffect(() => {
    if (match?.params?.zid) {
      const roomAlias = `${match.params.zid}:${config.matrixHomeServerName}`;
      dispatch(validateFeedChat({ id: roomAlias }));
    }
  }, [dispatch, match?.params]);

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
