export const isElectron = (): boolean => {
  return window.location.protocol === 'file:';
};
