import React from 'react';

import ReactDOM from 'react-dom';
import { MessengerMain } from './messenger-main';
import { store, runSagas } from './store';
import { Provider } from 'react-redux';
import { EscapeManagerProvider } from '@zer0-os/zos-component-library';
import * as serviceWorker from './serviceWorker';
import { Router, Redirect, Route, Switch } from 'react-router-dom';
import { ContextProvider as Web3ReactContextProvider } from './lib/web3/web3-react';
import { showReleaseVersionInConsole, initializeErrorBoundary, isElectron } from './utils';
import { ErrorBoundary } from './components/error-boundary/';
import BodyClassManager from './components/body-class-manager';
import { ProtectedRoute } from './components/protected-route';
import '@zer0-os/zos-component-library/dist/index.css';
import './index.scss';
import { Invite } from './invite';
import { ResetPassword } from './reset-password';
import { LoginPage } from './pages';
import { Web3Connect } from './components/web3-connect';
import { getHistory } from './lib/browser';
import { ElectronTitlebar } from './components/electron-titlebar';

runSagas();

initializeErrorBoundary();

showReleaseVersionInConsole();

export const history = getHistory();

const redirectToRoot = () => <Redirect to={'/'} />;

ReactDOM.render(
  <React.StrictMode>
    <ErrorBoundary boundary={'core'}>
      <Provider store={store}>
        <EscapeManagerProvider>
          <Router history={history}>
            <Web3ReactContextProvider>
              <Web3Connect>
                {isElectron() && <ElectronTitlebar />}
                <BodyClassManager />
                <Switch>
                  <Route path='/get-access' exact component={Invite} />
                  <Route path='/login' exact component={LoginPage} />
                  <Route path='/reset-password' exact component={ResetPassword} />
                  <ProtectedRoute path='/conversation/:conversationId' exact component={MessengerMain} />
                  <ProtectedRoute path='/' exact component={MessengerMain} />
                  <Route component={redirectToRoot} />
                </Switch>
              </Web3Connect>
            </Web3ReactContextProvider>
          </Router>
        </EscapeManagerProvider>
      </Provider>
    </ErrorBoundary>
  </React.StrictMode>,
  document.getElementById('platform')
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
