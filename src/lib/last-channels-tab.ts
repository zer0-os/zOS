const LAST_CHANNELS_TAB_KEY = 'last-active-channels-tab';

export const setLastActiveChannelsTab = (tab: string): void => {
  if (tab) {
    localStorage.setItem(LAST_CHANNELS_TAB_KEY, tab);
  }
};

export const getLastActiveChannelsTab = (): string | null => {
  return localStorage.getItem(LAST_CHANNELS_TAB_KEY);
};

export const clearLastActiveChannelsTab = (): void => {
  localStorage.removeItem(LAST_CHANNELS_TAB_KEY);
};
