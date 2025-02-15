import classNames from 'classnames';
import { IfAuthenticated } from '../../../authentication/if-authenticated';
import styles from './styles.module.scss';
import { Panel } from '../../../layout/panel';

export interface ContainerProps {
  className?: string;
  children?: React.ReactNode;
}

export const Container = ({ className, children }: ContainerProps) => {
  return (
    <IfAuthenticated showChildren>
      <div className={classNames(styles.Container, className)}>
        <Panel className={styles.Wrapper}>
          <div className={styles.Content}>
            <div className={styles.Messages}>{children}</div>
          </div>
        </Panel>
      </div>
    </IfAuthenticated>
  );
};
