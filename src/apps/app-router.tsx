/*
 * AppRouter controls which app is rendered based on the route.
 * e.g.
 * - /conversation/:conversationId renders Messenger
 */

import { Redirect, Route, Switch } from 'react-router-dom';
import { MessengerMain } from '../messenger-main';
import { FeatureFlag } from '../components/feature-flag';

const redirectToRoot = () => <Redirect to={'/'} />;

export const AppRouter = () => {
  return (
    <Switch>
      <Route path='/conversation/:conversationId' exact component={MessengerMain} />
      <Route path='/' exact component={MessengerMain} />
      {process.env.NODE_ENV !== 'test' && (
        <FeatureFlag featureFlag='enableExplorer'>
          <Route path='/explorer' exact component={MockExplorer} />
        </FeatureFlag>
      )}
      <Route component={redirectToRoot} />
    </Switch>
  );
};

const MockExplorer = () => {
  return (
    <iframe
      style={{ width: '100%', height: '100%', border: 'none', pointerEvents: 'auto' }}
      src={'https://explorer.zero.tech/'}
      title='Explorer'
    />
  );
};
