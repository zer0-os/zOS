export const calculateMultiplier = (lockDays: number): number => {
  const minDays = 30;
  const maxDays = 365;
  const minMultiplier = 1.0;
  const maxMultiplier = 10.0;

  if (lockDays < minDays) return 0;
  if (lockDays >= maxDays) return maxMultiplier;

  return minMultiplier + (maxMultiplier - minMultiplier) * (lockDays / maxDays);
};
