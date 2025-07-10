import { IconArrowDownLeft, IconArrowUpRight } from '@zero-tech/zui/icons';
import { Button } from '../components/button/button';
import { ZeroCard } from '../components/zero-card/zero-card';
import { TokensList } from '../tokens/tokens-list';
import { PanelBody } from '../../../components/layout/panel';
import { WalletTabs } from '../components/tabs/tabs';
import { Route, Switch, Redirect } from 'react-router-dom';
import { TransactionsList } from '../transactions/transactions-list';
import { userFirstNameSelector } from '../../../store/authentication/selectors';
import { useDispatch, useSelector } from 'react-redux';
import { NFTsList } from '../nfts/nfts-list';
import { getHistory } from '../../../lib/browser';
import { reset } from '../../../store/wallet';

import styles from './wallet-home.module.scss';
const history = getHistory();

export const WalletHome = () => {
  const userName = useSelector(userFirstNameSelector);
  const dispatch = useDispatch();

  const handleSend = () => {
    dispatch(reset());
    history.push('/wallet/send');
  };

  return (
    <PanelBody className={styles.walletApp}>
      <div className={styles.header}>
        <ZeroCard displayName={userName} />
        <div className={styles.actions}>
          <Button onClick={() => {}} icon={<IconArrowDownLeft size={18} />}>
            Receive
          </Button>
          <Button onClick={handleSend} icon={<IconArrowUpRight size={18} />}>
            Send
          </Button>
        </div>
      </div>

      <div className={styles.tabs}>
        <WalletTabs />
      </div>

      <div className={styles.walletView}>
        <Switch>
          <Route path={'/wallet'} exact>
            <TokensList />
          </Route>
          <Route path={'/wallet/transactions'} exact>
            <TransactionsList />
          </Route>
          <Route path={'/wallet/nfts'} exact>
            <NFTsList />
          </Route>
          <Redirect to={'/wallet'} />
        </Switch>
      </div>
    </PanelBody>
  );
};
