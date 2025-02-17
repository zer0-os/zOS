import { IfAuthenticated } from '../../../authentication/if-authenticated';
import { LegacyPanel } from '../../../layout/panel';

import classNames from 'classnames';
import styles from './styles.module.scss';

export interface ContainerProps {
  className?: string;
  children?: React.ReactNode;
  header?: React.ReactNode;
}

export const Container = ({ className, children, header }: ContainerProps) => {
  return (
    <IfAuthenticated showChildren>
      <div className={classNames(styles.Container, className)}>
        {header}
        <LegacyPanel className={styles.Wrapper}>
          <div className={styles.Content}>
            <div className={styles.Messages}>{children}</div>
          </div>
        </LegacyPanel>
      </div>
    </IfAuthenticated>
  );
};
