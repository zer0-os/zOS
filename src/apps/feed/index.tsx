import { Switch, Route, Redirect } from 'react-router-dom';

import { Feed } from './components/feed';
import { PostView } from './components/post-view-container';
import { ScrollbarContainer } from '../../components/scrollbar-container';

import styles from './styles.module.scss';

export const FeedApp = () => {
  return (
    <div className={styles.Feed}>
      <ScrollbarContainer className={styles.Scroll} variant='on-hover'>
        <Switch>
          <Route path='/feed/:zid/:postId' component={({ match }: any) => <PostView postId={match.params.postId} />} />
          <Route path='/feed/:zid' component={({ match }: any) => <Feed zid={match.params.zid} />} />
          <Redirect to='/feed/16test' />
        </Switch>
      </ScrollbarContainer>
    </div>
  );
};
