import { Switch, Route, Redirect, useRouteMatch } from 'react-router-dom';

import { useOwnedZids } from '../../lib/hooks/useOwnedZids';
import { parseWorldZid } from '../../lib/zid';
import { useScrollPosition } from '../../lib/hooks/useScrollPosition';

import { Feed } from './components/feed';
import { Sidekick } from './components/sidekick';
import { PostView } from './components/post-view-container';
import { PanelBody } from '../../components/layout/panel';
import { IconSlashes } from '@zero-tech/zui/icons';
import { FeedChat } from './components/feed-chat/container';
import { getLastActiveFeed } from '../../lib/last-feed';

import styles from './styles.module.scss';

export const FeedApp = () => {
  const route = useRouteMatch<{ postId: string }>('/feed/:zid/:postId');
  const postId = route?.params?.postId;
  useScrollPosition(postId);

  return (
    <div className={styles.Feed}>
      <Sidekick />
      <div className={styles.Wrapper}>
        <Switch>
          <Route
            path='/feed/:zid/:postId'
            component={({ match }: any) => <PostView postId={match.params.postId} isFeed={true} />}
          />
          <Route path='/feed/:zid' component={({ match }: any) => <Feed zid={match.params.zid} />} />
          <Route path='/feed' component={Loading} />
        </Switch>
        <FeedChat />
      </div>
    </div>
  );
};

const Loading = () => {
  const { isLoading, zids } = useOwnedZids();

  if (isLoading) {
    return (
      <PanelBody className={styles.Loading}>
        <IconSlashes /> Loading channels...
      </PanelBody>
    );
  }

  if (!zids?.length) {
    return (
      <PanelBody className={styles.Loading}>
        <IconSlashes /> You are not a member of any channels.
      </PanelBody>
    );
  }

  const lastActiveFeed = getLastActiveFeed();

  // If we have a last active feed and it's in the list of owned zids, use it
  if (lastActiveFeed && zids.some((zid) => parseWorldZid(zid) === lastActiveFeed)) {
    return <Redirect to={`/feed/${lastActiveFeed}`} />;
  }

  return <Redirect to={`/feed/${parseWorldZid(zids[0])}`} />;
};
