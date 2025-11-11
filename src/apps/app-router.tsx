/*
 * AppRouter controls which app is rendered based on the route.
 * e.g.
 * - /conversation/:conversationId renders Messenger
 */

import { Redirect, Route, Switch, useLocation } from 'react-router-dom';
import { MessengerApp } from './messenger';
import { ConversationRouter } from './conversation-router';
import { FeedApp } from './feed';
import { ExplorerApp } from './explorer';
import { NotificationsApp } from './notifications';
import { HomeApp } from './home';
import { ProfileApp } from './profile';
import { featureFlags } from '../lib/feature-flags';
import { useSelector } from 'react-redux';
import { Provider as AuthenticationContextProvider } from '../components/authentication/context';
import { AuraApp } from './aura';
import { DexApp } from './dex';
import { TokenApp } from './token';
import { Container as SidekickContainer } from '../components/sidekick/components/container';
import { Stage } from '../store/user-profile';
import { activeZAppFeatureSelector, isZAppActiveSelector } from '../store/active-zapp/selectors';
import { isAuthenticatedSelector } from '../store/authentication/selectors';
import { userProfileStageSelector } from '../store/user-profile/selectors';
import { WalletApp } from './wallet';
import { LeaderboardApp } from './leaderboard';
import { MarketplaceApp } from './marketplace';

import styles from './app-router.module.css';

const redirectToRoot = () => <Redirect to={'/'} />;

export const AppRouter = () => {
  const isAuthenticated = useSelector(isAuthenticatedSelector);

  return (
    <AuthenticationContextProvider value={{ isAuthenticated }}>
      <Sidekick />

      <Switch>
        <Route path='/conversation/:conversationId' component={ConversationRouter} />
        <Route path='/' exact component={MessengerApp} />
        <Route path='/home' component={HomeApp} />
        <Route path='/feed' component={FeedApp} />
        <Route path='/explorer' component={ExplorerApp} />
        <Route path='/notifications' component={NotificationsApp} />
        {featureFlags.enableAuraZApp && <Route path='/aura' component={AuraApp} />}
        {featureFlags.enableDex && <Route path='/swap' component={DexApp} />}
        {featureFlags.enableTokenZApp && <Route path='/token' component={TokenApp} />}
        <Route path='/profile' component={ProfileApp} />
        <Route path='/wallet' component={WalletApp} />
        <Route path='/leaderboard' component={LeaderboardApp} />
        {featureFlags.enableMarketplace && <Route path='/marketplace' component={MarketplaceApp} />}
        <Route component={redirectToRoot} />
      </Switch>
    </AuthenticationContextProvider>
  );
};

// Paths that should hide the sidekick menu
export const HIDE_SIDEKICK_PATHS = [
  '/home',
  '/profile',
  '/wallet',
  '/leaderboard',
  '/token',
  '/marketplace',
];

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
   * We only want to render the sidekick when the user is not on a path that should hide it,
   * or if the user profile is open.
   */
  const renderSidekick =
    !(HIDE_SIDEKICK_PATHS.some((path) => location.pathname.startsWith(path)) || isActiveZApp) ||
    userProfileStage !== Stage.None;

  return (
    <>
      {!renderSidekick && !isFullscreenZApp && <div className={styles.sidekickSpace} />}
      {/* Sidekick needs to stay in the dom since it's element is referenced in a portal */}
      <SidekickContainer className={!renderSidekick ? styles.sidekickHidden : ''} />
    </>
  );
};
