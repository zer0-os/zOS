import { ReactNode } from 'react';

import { ScrollbarContainer } from '../../../scrollbar-container';

import styles from './styles.module.scss';

export interface ScrollProps {
  children: ReactNode;
  isScrollbarHidden?: boolean;
}

export const Scroll = ({ children, isScrollbarHidden = true }: ScrollProps) => {
  return (
    <ScrollbarContainer variant='on-hover' className={styles.Scroll} isScrollbarHidden={isScrollbarHidden}>
      {children}
    </ScrollbarContainer>
  );
};
