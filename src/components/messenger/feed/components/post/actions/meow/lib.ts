const INCREMENTS = 10;
const MS_BETWEEN_INCREMENTS = 1000;
const OPTIONS = 3;

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
  return 1 + (Math.min(amount, max) / increments) * 0.05;
};
