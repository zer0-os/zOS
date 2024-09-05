import { AnimatePresence, motion } from 'framer-motion';
import { Action } from '@zero-tech/zui/components/Post';

import { MeowIcon } from './icon';
import { useMeowAction } from './useMeow';

import styles from './meow-action.module.scss';

export interface MeowActionProps {
  meows?: number;
}

export const MeowAction = ({ meows = 0 }: MeowActionProps) => {
  const { amount, backgroundOpacity, cancel, isActive, scale, start, stop, totalMeows } = useMeowAction(meows);

  return (
    <motion.div style={{ scale }} onTapStart={start} onTap={stop} onTapCancel={cancel} className={styles.Container}>
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
        <span>{totalMeows}</span>
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
