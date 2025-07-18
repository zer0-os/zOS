import { Panel } from '../../components/layout/panel';
import { Route, Switch } from 'react-router-dom';
import { WalletSend } from './send/wallet-send';

import styles from './wallet-app.module.scss';
import { WalletHome } from './home/wallet-home';
import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { reset } from '../../store/wallet';
import { errorSelector } from '../../store/wallet/selectors';
import { WalletErrorView } from './error/wallet-error-view';

export const WalletApp = () => {
  const dispatch = useDispatch();
  const error = useSelector(errorSelector);

  useEffect(() => {
    dispatch(reset());
  }, [dispatch]);

  return (
    <div className={styles.walletAppContainer}>
      <Panel className={styles.walletAppPanel}>
        {error ? (
          <WalletErrorView />
        ) : (
          <Switch>
            <Route path={'/wallet/send'} exact>
              <WalletSend />
            </Route>
            <Route path={'/wallet'}>
              <WalletHome />
            </Route>
          </Switch>
        )}
      </Panel>
    </div>
  );
};
