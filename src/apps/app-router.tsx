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
import { useSelector } from 'react-redux';
import { RootState } from '../store/reducer';
import { Provider as AuthenticationContextProvider } from '../components/authentication/context';

const redirectToRoot = () => <Redirect to={'/'} />;

export const AppRouter = () => {
  const isAuthenticated = useSelector((state: RootState) => !!state.authentication.user?.data);

  return (
    <AuthenticationContextProvider value={{ isAuthenticated }}>
      <Switch>
        <Route path='/conversation/:conversationId' component={MessengerApp} />
        <Route path='/' exact component={MessengerApp} />
        {featureFlags.enableFeedApp && <Route path='/feed' component={FeedApp} />}
        <Route path='/explorer' component={ExplorerApp} />
        {featureFlags.enableNotificationsApp && <Route path='/notifications' component={NotificationsApp} />}
        <Route component={redirectToRoot} />
      </Switch>
    </AuthenticationContextProvider>
  );
};
