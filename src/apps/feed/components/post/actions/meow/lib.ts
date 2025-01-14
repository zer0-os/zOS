const INCREMENTS = 1;
const MS_BETWEEN_INCREMENTS = 75;
const OPTIONS = 100;
const MAX_SCALE = 1.25;

interface MeowActionConfig {
  increments: number;
  msBetweenIncrements: number;
  options: number;
  max: number;
}

export const CONFIG: MeowActionConfig = {
  increments: INCREMENTS,
  msBetweenIncrements: MS_BETWEEN_INCREMENTS,
  options: OPTIONS,
  max: INCREMENTS * OPTIONS,
};

export const getScale = (amount: number, increments: number, max: number): number => {
  const scale = 1 + (Math.min(amount, max) / increments) * 0.005;
  return Math.min(scale, MAX_SCALE);
};
