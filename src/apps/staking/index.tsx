import { Panel, PanelBody } from '../../components/layout/panel';
import { StakingPoolTable } from './features/view-staking-pools';

import styles from './styles.module.scss';

export const StakingApp = () => {
  return (
    <div className={styles.Container}>
      <Panel name='Staking' className={styles.Panel}>
        <PanelBody>
          <StakingPoolTable />
        </PanelBody>
      </Panel>
    </div>
  );
};
