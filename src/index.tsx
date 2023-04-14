import React from 'react';

import ReactDOM from 'react-dom';
import { store } from './store';
import { Provider } from 'react-redux';
import { EscapeManagerProvider } from '@zer0-os/zos-component-library';
import * as serviceWorker from './serviceWorker';
import { Router, Route } from 'react-router-dom';
import { createBrowserHistory } from 'history';
import { showReleaseVersionInConsole, initializeErrorBoundary } from './utils';
import { ErrorBoundary } from './components/error-boundary/';

import { AppSandboxContainer } from './app-sandbox/container';

import './index.scss';
import { Main } from './Main';

initializeErrorBoundary();

showReleaseVersionInConsole();

const history = createBrowserHistory();

const main = () => {
  return <Main />;
};

ReactDOM.render(
  <React.StrictMode>
    <ErrorBoundary boundary={'core'}>
      <Provider store={store}>
        <EscapeManagerProvider>
          <Router history={history}>
            <Route path='/:znsRoute?/' exact render={main} />
          </Router>
        </EscapeManagerProvider>
      </Provider>
    </ErrorBoundary>
  </React.StrictMode>,
  document.getElementById('platform')
);

// The reason for the separate react app is to keep the sandbox isolated from the main app.
// Everything contained within this render tree should be limited to what is necessary to
// load and render the child apps. Anything exposed in this tree should also be done in
// such a way that it won't interfere with the loaded app. (eg. pass the store directly
// to components rather than using a provider.)
ReactDOM.render(
  <ErrorBoundary boundary={'apps'}>
    <Provider store={store}>
      <AppSandboxContainer />
    </Provider>
  </ErrorBoundary>,
  document.getElementById('app-sandbox')
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
