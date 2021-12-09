import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import { Main } from './Main';
import { store } from './store';
import { Provider } from 'react-redux';
import * as serviceWorker from './serviceWorker';
// XXX - this library is entirely untested, and a liability. we should move away from it,
// but using it initially to get up and running. make sure we maintain
// isolation.
import Web3Provider, { Connectors as Web3ReactConnectors } from 'web3-react';
import { config } from './config';
import { Web3Connect } from './core-components/web3-connect';
import { Connectors } from './core-components/web3-connect';

const { NetworkOnlyConnector } = Web3ReactConnectors;

const connectors = {
  [Connectors.Infura]: new NetworkOnlyConnector({
    providerURL: config.INFURA_URL,
  }),
};

ReactDOM.render(
  <React.StrictMode>
    <Provider store={store}>
      <Web3Provider connectors={connectors} libraryName='ethers.js'>
        <Web3Connect>
          <Main />
        </Web3Connect>
      </Web3Provider>
    </Provider>
  </React.StrictMode>,
  document.getElementById('root')
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
