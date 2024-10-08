import { AnimatePresence, motion } from 'framer-motion';
import { Action } from '@zero-tech/zui/components/Post';

import { MeowIcon } from './icon';
import { useMeowAction } from './useMeow';

import styles from './meow-action.module.scss';

export interface MeowActionProps {
  meows?: number;
  isDisabled?: boolean;
  ownerUserId: string;
  messageId: string;
  transferError?: string;

  transferMeow: (postOwnerId, postMessageId, meowAmount) => void;
}

export const MeowAction = ({
  meows = 0,
  isDisabled,
  transferMeow,
  ownerUserId,
  messageId,
  transferError,
}: MeowActionProps) => {
  const { incrementalAmount, backgroundOpacity, scale, cancel, start, stop, displayTotal } = useMeowAction(
    meows,
    transferError
  );

  const handleStop = () => {
    if (incrementalAmount) {
      transferMeow(ownerUserId, messageId, incrementalAmount.toString());
    }
    stop();
  };

  return (
    <motion.div
      style={{ scale }}
      onTapStart={start}
      onTap={handleStop}
      onTapCancel={cancel}
      className={`${styles.Container} ${isDisabled && styles.Disabled}`}
    >
      <Action>
        <AnimatePresence>
          {incrementalAmount && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: backgroundOpacity }}
              exit={{ opacity: 0 }}
              className={styles.Wash}
            />
          )}
        </AnimatePresence>
        <MeowIcon />
        <span>{displayTotal}</span>
      </Action>
    </motion.div>
  );
};
