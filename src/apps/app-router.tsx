/*
 * AppRouter controls which app is rendered based on the route.
 * e.g.
 * - /conversation/:conversationId renders Messenger
 */

import { Redirect, Route, Switch, useLocation } from 'react-router-dom';
import { MessengerApp } from './messenger';
import { FeedApp } from './feed';
import { ExplorerApp } from './explorer';
import { NotificationsApp } from './notifications';
import { HomeApp } from './home';
import { featureFlags } from '../lib/feature-flags';
import { useSelector } from 'react-redux';
import { RootState } from '../store/reducer';
import { Provider as AuthenticationContextProvider } from '../components/authentication/context';
import { AuraApp } from './aura';
import styles from './app-router.module.css';

import { Container as SidekickContainer } from '../components/sidekick/components/container';
import { Header as SidekickHeader } from '../components/sidekick/components/header';
import { CurrentUserDetails } from '../components/sidekick/components/current-user-details';
import { activeZAppFeatureSelector, isZAppActiveSelector } from '../store/active-zapp/selectors';

const redirectToRoot = () => <Redirect to={'/'} />;

export const AppRouter = () => {
  const isAuthenticated = useSelector((state: RootState) => !!state.authentication.user?.data);
  const location = useLocation();
  const isActiveZApp = useSelector(isZAppActiveSelector);
  const isFullscreenZApp = useSelector(activeZAppFeatureSelector('fullscreen'));
  const renderSidekick = !(location.pathname.startsWith('/home') || isActiveZApp);

  return (
    <AuthenticationContextProvider value={{ isAuthenticated }}>
      <SidekickContainer className={!renderSidekick ? styles.sidekickHidden : ''}>
        <SidekickHeader>
          <CurrentUserDetails />
        </SidekickHeader>
      </SidekickContainer>

      {/* temporary fix to fill missing sidekick space */}
      {!renderSidekick && !isFullscreenZApp && <div className={styles.sidekickSpace} />}

      <Switch>
        <Route path='/conversation/:conversationId' component={MessengerApp} />
        <Route path='/' exact component={MessengerApp} />
        <Route path='/home' component={HomeApp} />
        {featureFlags.enableFeedApp && <Route path='/feed' component={FeedApp} />}
        <Route path='/explorer' component={ExplorerApp} />
        {featureFlags.enableNotificationsApp && <Route path='/notifications' component={NotificationsApp} />}
        {featureFlags.enableAuraZApp && <Route path='/aura' component={AuraApp} />}
        <Route component={redirectToRoot} />
      </Switch>
    </AuthenticationContextProvider>
  );
};
