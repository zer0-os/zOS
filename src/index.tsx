import React from 'react';
import ReactDOM from 'react-dom';
import { ZnsRouteConnect } from './zns-route-connect';
import { store } from './store';
import { Provider } from 'react-redux';
import { EscapeManagerProvider } from '@zer0-os/zos-component-library';
import * as serviceWorker from './serviceWorker';
import { Router, Redirect, Route } from 'react-router-dom';
import { createBrowserHistory } from 'history';
import { ContextProvider as Web3ReactContextProvider } from './lib/web3/web3-react';
import { config } from './config';

import { AppSandboxContainer } from './app-sandbox/container';

import '../node_modules/@zer0-os/zos-component-library/dist/index.css';
import './index.scss';

const history = createBrowserHistory();

ReactDOM.render(
  <React.StrictMode>
    <Provider store={store}>
      <EscapeManagerProvider>
        <Router history={history}>
          <Web3ReactContextProvider>
            <Route path='/' exact>
              <Redirect to={`/${config.defaultZnsRoute}/${config.defaultApp}`} />
            </Route>
            <Route path='/:znsRoute/:app?' component={ZnsRouteConnect} />
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
ReactDOM.render((
    <Router history={history}>
      <div className='app-sandbox-wrapper'>
        <AppSandboxContainer store={store} />
      </div>
    </Router>
  ),
  document.getElementById('app-sandbox')
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
