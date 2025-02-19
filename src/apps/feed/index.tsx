import { Switch, Route, Redirect } from 'react-router-dom';

import { useOwnedZids } from '../../lib/hooks/useOwnedZids';

import { Feed } from './components/feed';
import { Sidekick } from './components/sidekick';
import { PostView } from './components/post-view-container';
import { PanelBody } from '../../components/layout/panel';
import { IconSlashes } from '@zero-tech/zui/icons';

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
        <Route path='/feed' component={Loading} />
      </Switch>
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

  return <Redirect to={`/feed/${zids?.[0]?.split('.')[0]}`} />;
};
