import { Switch, Route, Redirect } from 'react-router-dom';
import { useState } from 'react';
import { Panel } from '../../components/layout/panel';
import { Sidekick } from './components/sidekick';
import { DexTable } from './components/dex-table';
import { TokenLauncher } from './components/token-launcher';
import { mockTokensByChain, defaultTokens } from './mock-tokens';
import { getLastActiveTokenChain } from '../../lib/last-token-chain';

import styles from './token-app.module.scss';

export const TokenApp = () => {
  const [showTokenLauncher, setShowTokenLauncher] = useState(false);

  const handleLaunchToken = () => {
    setShowTokenLauncher(true);
  };

  const handleBackToTokens = () => {
    setShowTokenLauncher(false);
  };

  return (
    <div className={styles.TokenAppContainer}>
      <Sidekick onLaunchToken={handleLaunchToken} />
      <div className={styles.Wrapper}>
        {showTokenLauncher ? (
          <TokenLauncher onBack={handleBackToTokens} />
        ) : (
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
        )}
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
