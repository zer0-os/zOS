export const getLoadingMessage = (progress: number): string => {
  if (progress < 30) {
    return 'Connecting to server...';
  } else if (progress < 50) {
    return 'Loading conversations...';
  } else if (progress < 70) {
    return 'Decrypting messages...';
  } else if (progress < 90) {
    return 'Finalizing...';
  } else {
    return 'Ready to chat!';
  }
};
