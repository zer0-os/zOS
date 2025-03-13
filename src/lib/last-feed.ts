const LAST_FEED_KEY = 'last-active-feed';

export const setLastActiveFeed = (feedZid: string): void => {
  if (feedZid) {
    localStorage.setItem(LAST_FEED_KEY, feedZid);
  }
};

export const getLastActiveFeed = (): string | null => {
  return localStorage.getItem(LAST_FEED_KEY);
};

export const clearLastActiveFeed = (): void => {
  localStorage.removeItem(LAST_FEED_KEY);
};
