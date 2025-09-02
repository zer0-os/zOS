import { Switch, Route, Redirect } from 'react-router-dom';
import { Panel } from '../../components/layout/panel';
import { Sidekick } from './components/sidekick';
import { DexTable } from './components/dex-table';
import { mockTokensByChain, defaultTokens } from './mock-tokens';
import { getLastActiveTokenChain } from '../../lib/last-token-chain';

import styles from './token-app.module.scss';

export const TokenApp = () => {
  return (
    <div className={styles.TokenAppContainer}>
      <Sidekick />
      <div className={styles.Wrapper}>
        <Switch>
          <Route
            path='/token/:chainId'
            component={({ match }: any) => (
              <Panel className={styles.TokenAppPanel}>
                <DexTable tokens={mockTokensByChain[match.params.chainId] || defaultTokens} />
              </Panel>
            )}
          />
          <Route path='/token' component={Loading} />
        </Switch>
      </div>
    </div>
  );
};

const Loading = () => {
  const lastActiveChain = getLastActiveTokenChain();

  if (lastActiveChain && mockTokensByChain[lastActiveChain]) {
    return <Redirect to={`/token/${lastActiveChain}`} />;
  }

  return (
    <Panel className={styles.TokenAppPanel}>
      <DexTable tokens={defaultTokens} />
    </Panel>
  );
};
