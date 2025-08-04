import './init';
import React from 'react';

import { createRoot } from 'react-dom/client';
import { store, runSagas } from './store';
import { Provider } from 'react-redux';
import { EscapeManagerProvider } from '@zero-tech/zui/lib/hooks/useEscapeManager';
import * as serviceWorker from './serviceWorker';
import { Router, Route, Switch } from 'react-router-dom';
import { showReleaseVersionInConsole, initializeErrorBoundary, isElectron } from './utils';
import { ErrorBoundary } from './components/error-boundary/';

import './index.scss';
import { Invite } from './invite';
import { ResetPassword } from './reset-password';
import { LoginPage, ErrorPage, OAuthCallback, OAuthLinkCallback, OAuthConsent } from './pages';
import { getHistory } from './lib/browser';
import { ElectronTitlebar } from './components/electron-titlebar';
import { desktopInit } from './lib/desktop';
import { Restricted } from './restricted';
import { RainbowKitConnect } from './lib/web3/rainbowkit/connect';
import { RainbowKitProvider } from './lib/web3/rainbowkit/provider';
import { App } from './App';

desktopInit();
runSagas();

initializeErrorBoundary();

showReleaseVersionInConsole();

export const history = getHistory();

const container = document.getElementById('platform');

const root = createRoot(container!); // createRoot(container!) if you use TypeScript

root.render(
  <React.StrictMode>
    <ErrorBoundary boundary={'core'}>
      <Provider store={store}>
        <EscapeManagerProvider>
          <Router history={history}>
            <RainbowKitProvider>
              <RainbowKitConnect>
                {isElectron() && <ElectronTitlebar />}
                <Switch>
                  <Route path='/restricted' exact component={Restricted} />
                  <Route path='/get-access' exact component={Invite} />
                  <Route path='/login' exact component={LoginPage} />
                  <Route path='/reset-password' exact component={ResetPassword} />
                  <Route path='/oauth/link/callback' exact component={OAuthLinkCallback} />
                  <Route path='/oauth/callback' exact component={OAuthCallback} />
                  <Route path='/oauth/consent' exact component={OAuthConsent} />
                  <Route path='/error' exact component={ErrorPage} />
                  <Route component={App} />
                </Switch>
              </RainbowKitConnect>
            </RainbowKitProvider>
          </Router>
        </EscapeManagerProvider>
      </Provider>
    </ErrorBoundary>
  </React.StrictMode>
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
