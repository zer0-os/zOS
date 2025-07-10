import { Panel } from '../../components/layout/panel';
import { Route, Switch } from 'react-router-dom';
import { WalletSend } from './send/wallet-send';

import styles from './wallet-app.module.scss';
import { WalletHome } from './home/wallet-home';

export const WalletApp = () => {
  return (
    <div className={styles.walletAppContainer}>
      <Panel className={styles.walletAppPanel}>
        <Switch>
          <Route path={'/wallet/send'} exact>
            <WalletSend />
          </Route>
          <Route path={'/wallet'}>
            <WalletHome />
          </Route>
        </Switch>
      </Panel>
    </div>
  );
};
