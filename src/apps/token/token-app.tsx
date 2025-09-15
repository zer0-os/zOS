import { Switch, Route, Redirect, useHistory } from 'react-router-dom';
import { useState } from 'react';
import { Panel } from '../../components/layout/panel';
import { Sidekick } from './components/sidekick';
import { DexTable } from './components/dex-table';
import { TokenLauncher } from './components/token-launcher';
import { TokenDetail } from './components/token-detail';
import { useZBancTokens } from './hooks/useZBancTokens';
import { convertZBancToTokenData } from './components/utils';

import styles from './token-app.module.scss';

export const TokenApp = () => {
  const history = useHistory();
  const [showTokenLauncher, setShowTokenLauncher] = useState(false);

  const { data: zbancTokens, isLoading, error } = useZBancTokens();

  const handleLaunchToken = () => {
    setShowTokenLauncher(true);
  };

  const handleBackToTokens = () => {
    setShowTokenLauncher(false);
  };

  const handleViewToken = (tokenAddress: string) => {
    setShowTokenLauncher(false);
    history.push(`/token/zchain/${tokenAddress}`);
  };

  const handleTokenClick = (tokenAddress: string) => {
    history.push(`/token/zchain/${tokenAddress}`);
  };

  const renderTokenList = () => {
    if (isLoading) {
      return (
        <div className={styles.Loading}>
          <div className={styles.Spinner} />
          <span>Loading tokens...</span>
        </div>
      );
    }

    if (error) {
      return (
        <div className={styles.Error}>
          <div className={styles.ErrorTitle}>Failed to load tokens</div>
          <div className={styles.ErrorMessage}>{error.message || 'An error occurred while loading tokens.'}</div>
        </div>
      );
    }

    return <DexTable tokens={convertZBancToTokenData(zbancTokens || [])} onTokenClick={handleTokenClick} />;
  };

  const renderMainContent = () => {
    if (showTokenLauncher) {
      return <TokenLauncher onBack={handleBackToTokens} onViewToken={handleViewToken} />;
    }

    return (
      <Switch>
        <Route
          path='/token/zchain/:tokenAddress'
          component={({ match }: any) => (
            <TokenDetail tokenAddress={match.params.tokenAddress} onBack={() => history.push('/token/zchain')} />
          )}
        />
        <Route
          path='/token/zchain'
          component={() => (
            <Panel className={styles.TokenAppPanel}>
              <div className={styles.Header}>
                <p>ZBanc Tokens on Z Chain</p>
              </div>
              {renderTokenList()}
            </Panel>
          )}
        />
        <Route path='/token' component={Loading} />
      </Switch>
    );
  };

  return (
    <div className={styles.TokenAppContainer}>
      <Sidekick onLaunchToken={handleLaunchToken} />
      <div className={styles.Wrapper}>{renderMainContent()}</div>
    </div>
  );
};

const Loading = () => {
  // Always redirect to Z Chain for ZBanc tokens
  return <Redirect to='/token/zchain' />;
};
