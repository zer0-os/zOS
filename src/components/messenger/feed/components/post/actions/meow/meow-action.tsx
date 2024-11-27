import { AnimatePresence, motion } from 'framer-motion';
import { Action } from '@zero-tech/zui/components/Post';

import { MeowIcon } from './icon';
import { useMeowAction } from './useMeow';

import styles from './meow-action.module.scss';

export interface MeowActionProps {
  meows?: number;
  isDisabled?: boolean;
  messageId: string;
  hasUserVoted: boolean;

  meowPost: (postId: string, meowAmount: string) => void;
}

export const MeowAction = ({ meows = 0, isDisabled, messageId, meowPost, hasUserVoted }: MeowActionProps) => {
  const { amount, backgroundOpacity, cancel, isActive, scale, start, stop } = useMeowAction();

  const handleStop = () => {
    if (amount) {
      meowPost(messageId, amount.toString());
    }
    stop();
  };

  return (
    <motion.div
      style={{
        scale,
      }}
      onTapStart={start}
      onTap={handleStop}
      onTapCancel={cancel}
      className={`${styles.Container} ${isDisabled && styles.Disabled} ${hasUserVoted && styles.Voted}`}
    >
      <Action>
        <AnimatePresence>
          {amount && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: backgroundOpacity }}
              exit={{ opacity: 0 }}
              className={styles.Wash}
            />
          )}
        </AnimatePresence>
        <MeowIcon />
        <span>{meows}</span>
        <AnimatePresence>
          {amount && isActive && (
            <motion.b
              initial={{ opacity: 0, y: '100%', width: 0 }}
              animate={{ opacity: 1, y: 0, width: 'auto' }}
              exit={{ opacity: 0, y: '-200%', width: 0 }}
              className={styles.Amount}
            >
              +{amount}
            </motion.b>
          )}
        </AnimatePresence>
      </Action>
    </motion.div>
  );
};
