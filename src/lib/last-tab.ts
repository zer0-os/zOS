const LAST_TAB_KEY = 'last-active-tab';

export const setLastActiveTab = (tab: string): void => {
  if (tab) {
    localStorage.setItem(LAST_TAB_KEY, tab);
  }
};

export const getLastActiveTab = (): string | null => {
  return localStorage.getItem(LAST_TAB_KEY);
};

export const clearLastActiveTab = (): void => {
  localStorage.removeItem(LAST_TAB_KEY);
};
