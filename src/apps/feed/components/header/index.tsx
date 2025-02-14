import { ReactNode } from 'react';

import { Panel } from '../../../../components/layout/panel';

import styles from './styles.module.scss';

export interface HeaderProps {
  children: ReactNode;
}

export const Header = ({ children }: HeaderProps) => {
  return <Panel className={styles.Header}>{children}</Panel>;
};
