import { useEffect, useRef, useState } from 'react';
import { useSpring } from 'framer-motion';
import { CONFIG, getScale } from './lib';

export const useMeowAction = (meows, transferError) => {
  const intervalRef = useRef(null);
  const scale = useSpring(1, { stiffness: 300, damping: 7 });

  const [incrementalAmount, setIncrementalAmount] = useState<number | null>(null);
  const [displayTotal, setDisplayTotal] = useState<number>(meows);
  const [originalAmount, setOriginalAmount] = useState<number>(meows);

  useEffect(() => {
    if (transferError) {
      resetTotalAmount();
    }
  }, [transferError]);

  /**
   * Starts the MEOW action
   * Creates a timer which increments the amount at a set interval
   * Stops when the amount reaches the maximum
   */
  const start = () => {
    setOriginalAmount(displayTotal);

    if (incrementalAmount === null) {
      setIncrementalAmount(CONFIG.increments);
      setDisplayTotal((prev) => prev + CONFIG.increments);
      scale.set(getScale(CONFIG.increments, CONFIG.increments, CONFIG.max));
    }

    intervalRef.current = setInterval(() => {
      setIncrementalAmount((prevAmount) => {
        const newAmount = (prevAmount ?? 0) + CONFIG.increments;

        if (newAmount > CONFIG.max) {
          return prevAmount;
        }

        setDisplayTotal((prev) => prev + CONFIG.increments);
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

  const resetTotalAmount = () => {
    setDisplayTotal(originalAmount);
  };

  const resetValues = () => {
    intervalRef.current && clearInterval(intervalRef.current);
    setIncrementalAmount(null);
    scale.set(1);
  };

  return {
    incrementalAmount,
    backgroundOpacity: (1 / CONFIG.max) * incrementalAmount,
    scale,
    start,
    stop,
    displayTotal,
  };
};
