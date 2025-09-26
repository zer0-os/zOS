import { Switch, Route, Redirect, useRouteMatch } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';

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
import { getLastActiveFeedConversation } from '../../lib/last-feed-conversation';
import { channelSelector } from '../../store/channels/selectors';
import { openConversationInFeed } from '../../store/channels';

import styles from './styles.module.scss';
import { MembersSidekick } from '../../components/sidekick/variants/members-sidekick';
import { Panel } from '../../store/panels/constants';

// Component to handle routing based on channel encryption status
const FeedRouteHandler = ({ zid }: { zid: string }) => {
  const channel = useSelector(channelSelector(zid));

  // If it's an unencrypted channel, show the chat (FeedChat handles this)
  if (channel && !channel.isEncrypted) {
    return null; // FeedChat will handle the rendering
  }

  // Otherwise, it's a social channel zid, show the regular feed
  return (
    <div className={styles.FeedWrapper}>
      <Feed zid={zid} panel={Panel.PUBLIC_FEED} panelName='Public Feed' header={<PanelTitle>Public Feed</PanelTitle>} />
    </div>
  );
};

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
          <Route path='/feed/:zid' component={({ match }: any) => <FeedRouteHandler zid={match.params.zid} />} />
          <Route path='/feed' component={Loading} />
        </Switch>
        <MembersSidekick className={styles.MembersSidekick} />
      </div>
    </div>
  );
};

const Loading = () => {
  const { isLoading, zids } = useOwnedZids();
  const dispatch = useDispatch();

  console.log('FeedApp Loading component - isLoading:', isLoading, 'zids:', zids);

  if (isLoading) {
    return (
      <PanelBody className={styles.Loading}>
        <IconSlashes /> Loading channels...
      </PanelBody>
    );
  }

  // Check for last active Feed conversation (unencrypted) FIRST
  const lastActiveFeedConversation = getLastActiveFeedConversation();
  console.log('FeedApp Loading - lastActiveFeedConversation:', lastActiveFeedConversation);

  if (lastActiveFeedConversation) {
    console.log('FeedApp Loading - opening conversation:', lastActiveFeedConversation);
    // Dispatch the action to open the conversation (this will set activeConversationId)
    dispatch(openConversationInFeed({ conversationId: lastActiveFeedConversation }));
    // Then redirect to the conversation URL
    return <Redirect to={`/feed/${lastActiveFeedConversation}`} />;
  }

  // Only check social channels if we have zids
  if (!zids?.length) {
    return (
      <PanelBody className={styles.Loading}>
        <IconSlashes /> You are not a member of any channels.
      </PanelBody>
    );
  }

  // Check for last active social channel feed
  const lastActiveFeed = getLastActiveFeed();
  console.log('FeedApp Loading - lastActiveFeed:', lastActiveFeed);

  if (lastActiveFeed && zids.some((zid) => parseWorldZid(zid) === lastActiveFeed)) {
    console.log('FeedApp Loading - redirecting to social channel:', lastActiveFeed);
    return <Redirect to={`/feed/${lastActiveFeed}`} />;
  }

  console.log('FeedApp Loading - redirecting to first zid:', parseWorldZid(zids[0]));
  return <Redirect to={`/feed/${parseWorldZid(zids[0])}`} />;
};
