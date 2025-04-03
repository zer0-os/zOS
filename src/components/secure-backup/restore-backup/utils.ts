export const getProgressText = (stage: string, total: number, successes: number): string => {
  switch (stage) {
    case 'start':
      return 'Starting secure backup restoration...';
    case 'fetch':
      return 'Fetching room keys...';
    case 'load_keys':
      return successes === total ? 'Keys loaded successfully' : 'Loading room keys...';
    default:
      return '';
  }
};
