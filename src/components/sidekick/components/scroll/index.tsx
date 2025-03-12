import { ReactNode } from 'react';

import { ScrollbarContainer } from '../../../scrollbar-container';

import styles from './styles.module.scss';

export interface ScrollProps {
  children: ReactNode;
}

export const Scroll = ({ children }: ScrollProps) => {
  return (
    <ScrollbarContainer variant='on-hover' className={styles.Scroll} isScrollbarHidden={true}>
      {children}
    </ScrollbarContainer>
  );
};
