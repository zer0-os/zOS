import { ReactNode } from 'react';

import { Header as HeaderComponent } from '../../../../components/layout/header';

import styles from './styles.module.scss';

export interface HeaderProps {
  children: ReactNode;
}

export const Header = ({ children }: HeaderProps) => {
  return <HeaderComponent className={styles.Header}>{children}</HeaderComponent>;
};
