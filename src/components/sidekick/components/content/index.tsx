import { ReactNode } from 'react';

import styles from './styles.module.scss';

export interface ContentProps {
  children: ReactNode;
}

export const Content = ({ children }: ContentProps) => {
  return <div className={styles.Content}>{children}</div>;
};
