import { Switch, Route, Redirect, useRouteMatch } from 'react-router-dom';

import { useOwnedZids } from '../../lib/hooks/useOwnedZids';
import { parseWorldZid } from '../../lib/zid';
import { useScrollPosition } from '../../lib/hooks/useScrollPosition';

import { Feed } from './components/feed';
import { Sidekick } from './components/sidekick';
import { PostView } from './components/post-view-container';
import { PanelBody, PanelTitle } from '../../components/layout/panel';
import { IconSlashes } from '@zero-tech/zui/icons';
import { FeedChat } from './components/feed-chat/container';
import { getLastActiveFeed } from '../../lib/last-feed';

import styles from './styles.module.scss';
import { MembersSidekick } from '../../components/sidekick/variants/members-sidekick';
import { Panel } from '../../store/panels/constants';

export const FeedApp = () => {
  const route = useRouteMatch<{ postId: string }>('/feed/:zid/:postId');
  const postId = route?.params?.postId;
  useScrollPosition(postId);

  return (
    <div className={styles.Feed}>
      <Sidekick />
      <div className={styles.Wrapper}>
        <FeedChat />
        <Switch>
          <Route
            path='/feed/:zid/:postId'
            component={({ match }: any) => (
              <div className={styles.FeedWrapper}>
                <PostView postId={match.params.postId} isFeed={true} />
              </div>
            )}
          />
          <Route
            path='/feed/:zid'
            component={({ match }: any) => (
              <div className={styles.FeedWrapper}>
                <Feed
                  zid={match.params.zid}
                  panel={Panel.PUBLIC_FEED}
                  panelName='Public Feed'
                  header={<PanelTitle>Public Feed</PanelTitle>}
                />
              </div>
            )}
          />
          <Route path='/feed' component={Loading} />
        </Switch>
        <MembersSidekick className={styles.MembersSidekick} />
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
