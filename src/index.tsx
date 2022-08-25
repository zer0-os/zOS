import React from 'react';

import ReactDOM from 'react-dom';
import { ZnsRouteConnect } from './zns-route-connect';
import { store } from './store';
import { Provider } from 'react-redux';
import { EscapeManagerProvider } from '@zer0-os/zos-component-library';
import * as serviceWorker from './serviceWorker';
import { Router, Redirect, Route } from 'react-router-dom';
import { createBrowserHistory, createHashHistory } from 'history';
import { ContextProvider as Web3ReactContextProvider } from './lib/web3/web3-react';
import { config } from './config';
import { isElectron, showReleaseVersionInConsole } from './utils';

import { AppSandboxContainer } from './app-sandbox/container';

import '../node_modules/@zer0-os/zos-component-library/dist/index.css';
import './index.scss';

showReleaseVersionInConsole();

const history = isElectron() ? createHashHistory() : createBrowserHistory();

const redirectToDefaults = ({ match: { params } }) => {
  const route = params.znsRoute || `0.${config.defaultZnsRoute}`;

  return <Redirect to={`/${route}/${config.defaultApp}`} />;
};

ReactDOM.render(
  <React.StrictMode>
    <Provider store={store}>
      <EscapeManagerProvider>
        <Router history={history}>
          <Web3ReactContextProvider>
            <Route
              path='/:znsRoute?/'
              exact
              render={redirectToDefaults}
            />
            <Route
              path='/:znsRoute/:app'
              component={ZnsRouteConnect}
            />
          </Web3ReactContextProvider>
        </Router>
      </EscapeManagerProvider>
    </Provider>
  </React.StrictMode>,
  document.getElementById('platform')
);

// The reason for the separate react app is to keep the sandbox isolated from the main app.
// Everything contained within this render tree should be limited to what is necessary to
// load and render the child apps. Anything exposed in this tree should also be done in
// such a way that it won't interfere with the loaded app. (eg. pass the store directly
// to components rather than using a provider.)
ReactDOM.render(
  <Router history={history}>
    <Route path='/:znsRoute/:app'>
      <AppSandboxContainer store={store} />
    </Route>
  </Router>,
  document.getElementById('app-sandbox')
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
