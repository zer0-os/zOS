export const getLoadingMessage = (progress: number): string => {
  if (progress < 40) {
    return 'Connecting to server...';
  } else if (progress < 60) {
    return 'Loading conversations...';
  } else if (progress < 90) {
    return 'Joining conversation...';
  } else {
    return 'Ready to chat!';
  }
};
