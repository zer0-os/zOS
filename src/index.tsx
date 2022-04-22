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

ReactDOM.render((
    <Router history={history}>
      <div className='app-sandbox-wrapper'>
        <div className='app-sandbox-wrapper__left-spacer' />
        <div className='app-sandbox-wrapper__content'>
          <AppSandboxContainer store={store} />
        </div>
        <div className='app-sandbox-wrapper__right-spacer' />
      </div>
    </Router>
  ),
  document.getElementById('app-sandbox')
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
