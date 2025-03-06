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
import { HomeApp } from './home';
import { featureFlags } from '../lib/feature-flags';
import { useSelector } from 'react-redux';
import { RootState } from '../store/reducer';
import { Provider as AuthenticationContextProvider } from '../components/authentication/context';
import { Container as SidekickContainer } from '../components/sidekick/components/container';
import { Header as SidekickHeader } from '../components/sidekick/components/header';
import { CurrentUserDetails } from '../components/sidekick/components/current-user-details';

const redirectToRoot = () => <Redirect to={'/'} />;

export const AppRouter = () => {
  const isAuthenticated = useSelector((state: RootState) => !!state.authentication.user?.data);

  return (
    <AuthenticationContextProvider value={{ isAuthenticated }}>
      <SidekickContainer>
        <SidekickHeader>
          <CurrentUserDetails />
        </SidekickHeader>
      </SidekickContainer>
      <Switch>
        <Route path='/conversation/:conversationId' component={MessengerApp} />
        <Route path='/' exact component={MessengerApp} />
        <Route path='/home' component={HomeApp} />
        {featureFlags.enableFeedApp && <Route path='/feed' component={FeedApp} />}
        <Route path='/explorer' component={ExplorerApp} />
        {featureFlags.enableNotificationsApp && <Route path='/notifications' component={NotificationsApp} />}
        <Route component={redirectToRoot} />
      </Switch>
    </AuthenticationContextProvider>
  );
};
