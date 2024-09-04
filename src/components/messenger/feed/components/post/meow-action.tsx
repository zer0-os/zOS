import { useRef, useState } from 'react';
import { AnimatePresence, motion, useSpring } from 'framer-motion';
import { Action } from '@zero-tech/zui/components/Post';

import styles from './meow-action.module.scss';

interface MeowActionConfig {
  increments: number;
  options: number;
  msBetweenIncrements: number;
}

const CONFIG: MeowActionConfig = {
  increments: 10,
  options: 3,
  msBetweenIncrements: 1000,
};

const MAX = CONFIG.increments * CONFIG.options;

export const MeowAction = () => {
  const { amount, stop, start, scale } = useMeowAction();

  return (
    <motion.div style={{ scale }} onTapStart={start} onTap={stop} className={styles.Container}>
      <Action>
        <AnimatePresence>
          {!!amount && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: (1 / MAX) * amount }}
              exit={{ opacity: 0 }}
              className={styles.Wash}
            />
          )}
        </AnimatePresence>
        <svg width='18' height='16' viewBox='0 0 18 16' fill='none' xmlns='http://www.w3.org/2000/svg'>
          <path
            d='M14.7736 9.58895C13.063 12.4503 9.54849 12.0278 9.54849 12.0278C9.54849 6.8438 14.0989 6.8438 14.0989 6.8438H15.6272C15.5026 7.99174 15.1925 8.88857 14.7736 9.58895ZM3.22642 9.58895C2.80755 8.88857 2.49736 7.99174 2.37283 6.8438H3.90113C3.90113 6.8438 8.45151 6.8438 8.45151 12.0278C8.45151 12.0278 4.93698 12.4503 3.22642 9.58895ZM16.5832 0L11.7272 3.81508H6.27283L1.41679 0L0 9.052L5.96094 15.6549C6.05887 15.7637 6.17887 15.8508 6.31245 15.91C6.44604 15.9693 6.59038 16 6.73642 16H11.2636C11.4096 16 11.554 15.9693 11.6875 15.91C11.8211 15.8508 11.9406 15.7637 12.0391 15.6549L18 9.052L16.5832 0Z'
            fill='#01F4CB'
          />
        </svg>
        <AnimatePresence>
          {amount && (
            <motion.span initial={{ opacity: 0, y: '100%' }} animate={{ opacity: 1, y: 0 }}>
              {amount}
            </motion.span>
          )}
        </AnimatePresence>
      </Action>
    </motion.div>
  );
};

const useMeowAction = () => {
  const intervalRef = useRef(null);
  const [amount, setAmount] = useState<number | null>(null);
  const scale = useSpring(1, { stiffness: 300, damping: 7 });

  const start = () => {
    if (amount === null) {
      setAmount(CONFIG.increments);
      scale.set(getScale(CONFIG.increments, CONFIG.increments, MAX));
    }
    intervalRef.current = setInterval(() => {
      setAmount((prevAmount) => {
        const newAmount = (prevAmount ?? 0) + CONFIG.increments;

        if (newAmount > MAX) {
          return prevAmount;
        }

        scale.set(getScale(newAmount, CONFIG.increments, MAX));
        return newAmount;
      });
    }, CONFIG.msBetweenIncrements);
  };

  const stop = () => {
    intervalRef.current && clearInterval(intervalRef.current);
    setAmount(null);
    scale.set(1);
  };

  return {
    amount,
    stop,
    start,
    scale,
  };
};

const getScale = (amount: number, increments: number, max: number): number => {
  const scaleStep = 0.05;
  const scaleBase = 1;

  if (amount > max) {
    return scaleBase + (max / increments) * scaleStep;
  }

  return scaleBase + (amount / increments) * scaleStep;
};
