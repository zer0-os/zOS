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
import { Provider as AuthenticationContextProvider } from '../components/authentication/context';
import { AuraApp } from './aura';
import { Container as SidekickContainer } from '../components/sidekick/components/container';
import { Stage } from '../store/user-profile';
import { activeZAppFeatureSelector, isZAppActiveSelector } from '../store/active-zapp/selectors';
import { isAuthenticatedSelector } from '../store/authentication/selectors';
import { userProfileStageSelector } from '../store/user-profile/selectors';

import styles from './app-router.module.css';

const redirectToRoot = () => <Redirect to={'/'} />;

export const AppRouter = () => {
  const isAuthenticated = useSelector(isAuthenticatedSelector);

  return (
    <AuthenticationContextProvider value={{ isAuthenticated }}>
      <Sidekick />

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

/**
 * Conditionally renders the sidekick based on the user's location and profile stage.
 * This is a utility so we don't have to read state in the AppRouter.
 */
const Sidekick = () => {
  const location = useLocation();
  const isActiveZApp = useSelector(isZAppActiveSelector);
  const isFullscreenZApp = useSelector(activeZAppFeatureSelector('fullscreen'));
  const userProfileStage = useSelector(userProfileStageSelector);

  /**
   * We only want to render the sidekick when the user is not on the home page,
   * or if the user profile is open.
   */
  const renderSidekick = !(location.pathname.startsWith('/home') || isActiveZApp) || userProfileStage !== Stage.None;

  return (
    <>
      {!renderSidekick && !isFullscreenZApp && <div className={styles.sidekickSpace} />}
      {/* Sidekick needs to stay in the dom since it's element is referenced in a portal */}
      <SidekickContainer className={!renderSidekick ? styles.sidekickHidden : ''} />
    </>
  );
};
