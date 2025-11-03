import { IconArrowDownLeft, IconArrowUpRight, IconArrowRight } from '@zero-tech/zui/icons';
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
import { Button } from '../components/button/button';
import { useState } from 'react';
import { ReceiveDialog } from './components/receive-dialog';
import { StakingList } from '../staking/staking-list';
import { featureFlags } from '../../../lib/feature-flags';

const history = getHistory();

export const WalletHome = () => {
  const userName = useSelector(userFirstNameSelector);
  const dispatch = useDispatch();
  const [openReceiveModal, setOpenReceiveModal] = useState(false);

  const handleSend = () => {
    dispatch(reset());
    history.push('/wallet/send');
  };

  const handleBridge = () => {
    history.push('/wallet/bridge');
  };

  return (
    <PanelBody className={styles.walletApp}>
      <div className={styles.header}>
        <ZeroCard displayName={userName} />
        <div className={`${styles.actions}${featureFlags.enableBridge ? ` ${styles.enableBridge}` : ''}`}>
          <Button onClick={() => setOpenReceiveModal(true)} icon={<IconArrowDownLeft size={18} />} variant='secondary'>
            Receive
          </Button>
          <Button onClick={handleSend} icon={<IconArrowUpRight size={18} />} variant='secondary'>
            Send
          </Button>
          {featureFlags.enableBridge && (
            <Button onClick={handleBridge} icon={<IconArrowRight size={18} />} variant='secondary'>
              Bridge
            </Button>
          )}
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
          {featureFlags.enableStaking && (
            <Route path={'/wallet/staking'} exact>
              <StakingList />
            </Route>
          )}
          <Redirect to={'/wallet'} />
        </Switch>
      </div>

      <ReceiveDialog open={openReceiveModal} onOpenChange={setOpenReceiveModal} />
    </PanelBody>
  );
};
