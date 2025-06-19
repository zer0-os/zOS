import React, { useState, useCallback } from 'react';

import { IconXClose, IconArrowLeft } from '@zero-tech/zui/icons';
import { IconButton } from '@zero-tech/zui/components/IconButton';

import styles from './styles.module.scss';

interface Props {
  children: React.ReactNode;
  onBack?: () => void;
  onClose?: () => void;
}

export const BottomSheet: React.FC<Props> = ({ children, onBack, onClose }) => {
  const [isOpen, setIsOpen] = useState(true);

  const handleClose = useCallback(() => {
    setIsOpen(false);
  }, []);

  const handleAnimationEnd = useCallback(() => {
    if (!isOpen && onClose) {
      onClose();
    }
  }, [isOpen, onClose]);

  return (
    <>
      <div className={isOpen ? styles.Overlay : `${styles.Overlay} ${styles.fadeOut}`} onClick={handleClose} />
      <div
        className={`${styles.BottomSheet} ${isOpen ? styles.slideUp : styles.slideDown}`}
        onAnimationEnd={handleAnimationEnd}
      >
        {onBack && <IconButton className={styles.BackButton} onClick={handleClose} Icon={IconArrowLeft} size={24} />}
        {children}
        {onClose && <IconButton className={styles.CloseButton} onClick={handleClose} Icon={IconXClose} size={24} />}
      </div>
    </>
  );
};
