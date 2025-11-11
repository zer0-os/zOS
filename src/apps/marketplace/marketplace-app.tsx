import { Route, Switch, Redirect } from 'react-router-dom';

import { Panel } from '../../components/layout/panel';

import styles from './marketplace-app.module.scss';

export const MarketplaceApp = () => {
  return (
    <div className={styles.marketplaceContainer}>
      <Panel className={styles.marketplacePanel}>
        <Switch>
          <Route path='/marketplace' exact>
            {/* Marketplace home will go here */}
            <div>Marketplace Home - Coming Soon</div>
          </Route>
          <Redirect to='/marketplace' />
        </Switch>
      </Panel>
    </div>
  );
};
