/*
 * AppRouter controls which app is rendered based on the route.
 * e.g.
 * - /conversation/:conversationId renders Messenger
 */

import { Redirect, Route, Switch } from 'react-router-dom';
import { MessengerApp } from './messenger';
import { FeedApp } from './feed';
import { ExplorerApp } from './explorer';
import { NotificationsApp } from './notifications';
import { featureFlags } from '../lib/feature-flags';

const redirectToRoot = () => <Redirect to={'/'} />;

export const AppRouter = () => {
  return (
    <Switch>
      <Route path='/conversation/:conversationId' component={MessengerApp} />
      <Route path='/' exact component={MessengerApp} />
      {featureFlags.enableFeedApp && <Route path='/feed' component={FeedApp} />}
      <Route path='/explorer' component={ExplorerApp} />
      {featureFlags.enableNotificationsApp && <Route path='/notifications' component={NotificationsApp} />}
      <Route component={redirectToRoot} />
    </Switch>
  );
};
