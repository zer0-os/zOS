import { useState, useEffect } from 'react';
import { IconCopy2, IconCheck } from '@zero-tech/zui/icons';
import { IconButton } from '@zero-tech/zui/components';

import styles from './styles.module.scss';

interface CodeDisplayProps {
  code: string;
}

export const CodeDisplay = ({ code }: CodeDisplayProps) => {
  const [isCopied, setIsCopied] = useState(false);

  const handleCopyCode = () => {
    navigator.clipboard.writeText(code);
    setIsCopied(true);
  };

  // Reset to copy icon after 2 seconds
  useEffect(() => {
    if (isCopied) {
      const timer = setTimeout(() => {
        setIsCopied(false);
      }, 2000);

      return () => clearTimeout(timer);
    }
  }, [isCopied]);

  return (
    <div className={styles.codeContainer}>
      <IconButton
        onClick={handleCopyCode}
        Icon={isCopied ? IconCheck : IconCopy2}
        aria-label={isCopied ? 'Copied!' : 'Copy referral code'}
        size={24}
        className={`${styles.copyButton} ${isCopied ? styles.copied : ''}`}
      />
    </div>
  );
};
