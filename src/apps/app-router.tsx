/*
 * AppRouter controls which app is rendered based on the route.
 * e.g.
 * - /conversation/:conversationId renders Messenger
 */

import { Redirect, Route, Switch } from 'react-router-dom';
import { MessengerMain } from '../messenger-main';

const redirectToRoot = () => <Redirect to={'/'} />;

export const AppRouter = () => {
  return (
    <Switch>
      <Route path='/conversation/:conversationId' exact component={MessengerMain} />
      <Route path='/' exact component={MessengerMain} />
      <Route component={redirectToRoot} />
    </Switch>
  );
};
