import { Panel } from '../../components/layout/panel';
import { Route, Switch } from 'react-router-dom';

import styles from './token-app.module.scss';

export const TokenApp = () => {
  return (
    <div className={styles.TokenAppContainer}>
      <Panel className={styles.TokenAppPanel}>
        <Switch>
          <Route path={'/token'}>
            <div>Token App - Coming Soon</div>
          </Route>
        </Switch>
      </Panel>
    </div>
  );
};
