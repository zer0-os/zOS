import { useRef, useState } from 'react';
import { useSpring } from 'framer-motion';
import { CONFIG, getScale } from './lib';

export const useMeowAction = () => {
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const scale = useSpring(1, { stiffness: 300, damping: 7 });

  const [amount, setAmount] = useState<number | null>(null);
  const [isActive, setIsActive] = useState(false);

  /**
   * Starts the MEOW action
   * Creates a timer which increments the amount at a set interval
   * Stops when the amount reaches the maximum
   * Also stops when cancel is called
   */
  const start = () => {
    setIsActive(true);

    if (amount === null) {
      setAmount(CONFIG.increments);
      scale.set(getScale(CONFIG.increments, CONFIG.increments, CONFIG.max));
    }

    intervalRef.current = setInterval(() => {
      setAmount((prevAmount) => {
        const newAmount = (prevAmount ?? 0) + CONFIG.increments;

        if (newAmount > CONFIG.max) {
          return prevAmount;
        }

        scale.set(getScale(newAmount, CONFIG.increments, CONFIG.max));
        return newAmount;
      });
    }, CONFIG.msBetweenIncrements);
  };

  /**
   * Successfully trigger MEOW
   */
  const stop = () => {
    resetValues();
  };

  /**
   * Cancel the MEOW action
   */
  const cancel = () => {
    resetValues();
  };

  const resetValues = () => {
    setIsActive(false);
    intervalRef.current && clearInterval(intervalRef.current);
    setAmount(null);
    scale.set(1);
  };

  return {
    amount,
    backgroundOpacity: (1 / CONFIG.max) * (amount ?? 0),
    cancel,
    isActive,
    scale,
    start,
    stop,
  };
};
