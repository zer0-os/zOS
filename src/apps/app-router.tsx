/*
 * AppRouter controls which app is rendered based on the route.
 * e.g.
 * - /conversation/:conversationId renders Messenger
 */

import { Redirect, Route, Switch } from 'react-router-dom';
import { MessengerApp } from './messenger';
import { ExplorerApp } from './explorer';

const redirectToRoot = () => <Redirect to={'/'} />;

export const AppRouter = () => {
  return (
    <Switch>
      <Route path='/conversation/:conversationId' exact component={MessengerApp} />
      <Route path='/' exact component={MessengerApp} />
      <Route path='/explorer' component={ExplorerApp} />
      <Route component={redirectToRoot} />
    </Switch>
  );
};
