const LAST_FEED_FILTER_KEY = 'last-feed-filter';

export enum FeedFilter {
  All = 'all',
  Following = 'following',
}

export const setLastFeedFilter = (filter: FeedFilter): void => {
  if (filter) {
    localStorage.setItem(LAST_FEED_FILTER_KEY, filter);
  }
};

export const getLastFeedFilter = (): FeedFilter => {
  const stored = localStorage.getItem(LAST_FEED_FILTER_KEY);
  return stored === FeedFilter.All ? FeedFilter.All : FeedFilter.Following;
};

export const clearLastFeedFilter = (): void => {
  localStorage.removeItem(LAST_FEED_FILTER_KEY);
};
