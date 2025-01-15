import { ReactNode } from 'react';

import styles from './styles.module.scss';

export interface HeaderProps {
  children: ReactNode;
}

export const Header = ({ children }: HeaderProps) => {
  return <div className={styles.Header}>{children}</div>;
};
