import React, { useState, useCallback } from 'react';

import { IconXClose } from '@zero-tech/zui/icons';
import { IconButton } from '@zero-tech/zui/components/IconButton';

import styles from './bridge-bottom-sheet.module.scss';

interface BridgeBottomSheetProps {
  children: React.ReactNode;
  onClose?: () => void;
  title?: string;
}

export const BridgeBottomSheet: React.FC<BridgeBottomSheetProps> = ({ children, onClose, title }) => {
  const [isOpen, setIsOpen] = useState(true);

  const close = useCallback(() => {
    setIsOpen(false);
  }, []);

  const onAnimationEnd = useCallback(() => {
    if (!isOpen && onClose) {
      onClose();
    }
  }, [isOpen, onClose]);

  return (
    <>
      <div className={isOpen ? styles.overlay : `${styles.overlay} ${styles.fadeOut}`} onClick={close} />
      <div
        className={`${styles.bottomSheet} ${isOpen ? styles.slideUp : styles.slideDown}`}
        onAnimationEnd={onAnimationEnd}
      >
        <div className={styles.header}>
          {title && <h3 className={styles.title}>{title}</h3>}
          {onClose && <IconButton className={styles.closeButton} onClick={close} Icon={IconXClose} size={24} />}
        </div>
        <div className={styles.content}>{children}</div>
      </div>
    </>
  );
};
