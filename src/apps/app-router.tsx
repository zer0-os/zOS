/*
 * AppRouter controls which app is rendered based on the route.
 * e.g.
 * - /conversation/:conversationId renders Messenger
 */

import { Redirect, Route, Switch } from 'react-router-dom';
import { MessengerMain } from '../messenger-main';
import { featureFlags } from '../lib/feature-flags';
import { ExplorerApp } from './explorer';

const redirectToRoot = () => <Redirect to={'/'} />;

export const AppRouter = () => {
  return (
    <Switch>
      <Route path='/conversation/:conversationId' exact component={MessengerMain} />
      <Route path='/' exact component={MessengerMain} />
      {featureFlags.enableExplorer && <Route path='/explorer' component={ExplorerApp} />}
      <Route component={redirectToRoot} />
    </Switch>
  );
};
