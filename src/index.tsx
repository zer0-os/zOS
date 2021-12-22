import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import { ZnsRouteConnect } from './zns-route-connect';
import { store } from './store';
import { Provider } from 'react-redux';
import { Provider as EscapeManagerProvider } from './lib/escape-manager';
import * as serviceWorker from './serviceWorker';
import { BrowserRouter, Redirect, Route } from 'react-router-dom';

import { ContextProvider as Web3ReactContextProvider } from './lib/web3/web3-react';
import {config} from './config';

ReactDOM.render(
  <React.StrictMode>
    <Provider store={store}>
      <EscapeManagerProvider>
        <BrowserRouter>
          <Web3ReactContextProvider>
            <Route path='/' exact>
              <Redirect to={`/${config.defaultZnsRoute}`} />
            </Route>
            <Route path='/:znsRoute' component={ZnsRouteConnect} />
          </Web3ReactContextProvider>
        </BrowserRouter>
      </EscapeManagerProvider>
    </Provider>
  </React.StrictMode>,
  document.getElementById('root')
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
