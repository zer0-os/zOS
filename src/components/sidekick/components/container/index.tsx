import { IfAuthenticated } from '../../../authentication/if-authenticated';
import { LegacyPanel } from '../../../layout/panel';
import { SIDEKICK_PORTAL_ID } from '../../lib/constants';
import { useSidekickContainer } from './useSidekickContainer';
import { UserProfileContainer } from '../../../messenger/user-profile/container';
import { Panel } from '../../../../store/panels/constants';

import classNames from 'classnames';
import styles from './styles.module.scss';

export interface ContainerProps {
  className?: string;
  children?: React.ReactNode;
  header?: React.ReactNode;
  variant?: 'primary' | 'secondary';
  panel?: Panel;
  name?: string;
}

export const Container = ({ className, children, header, variant = 'primary', panel, name }: ContainerProps) => {
  const { isSettingsOpen } = useSidekickContainer(variant);

  return (
    <IfAuthenticated showChildren>
      <div className={classNames(styles.Container, className)}>
        <LegacyPanel className={styles.Wrapper} panel={panel} name={name}>
          {isSettingsOpen && <UserProfileContainer />}

          {!isSettingsOpen && header}
          {/* We're not removing the portal from the DOM here because it causes issues
           * with the sidekick portal. */}
          <div data-is-hidden={isSettingsOpen ? '' : null} className={styles.Content} id={SIDEKICK_PORTAL_ID}>
            {children}
          </div>
        </LegacyPanel>
      </div>
    </IfAuthenticated>
  );
};
