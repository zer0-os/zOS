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
import { isZAppActiveSelector } from '../store/active-zapp/selectors';
import { Stage } from '../store/user-profile';

const redirectToRoot = () => <Redirect to={'/'} />;

export const AppRouter = () => {
  const isAuthenticated = useSelector((state: RootState) => !!state.authentication.user?.data);

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
  const userProfileStage = useSelector((state: RootState) => state.userProfile.stage);

  /**
   * We only want to render the sidekick when the user is not on the home page,
   * or if the user profile is open.
   */
  const renderSidekick = !(location.pathname.startsWith('/home') || isActiveZApp) || userProfileStage !== Stage.None;

  return <SidekickContainer className={!renderSidekick ? styles.sidekickHidden : ''} />;
};
