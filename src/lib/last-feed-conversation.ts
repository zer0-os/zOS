const LAST_FEED_CONVERSATION_KEY = 'last-active-feed-conversation';

export const setLastActiveFeedConversation = (conversationId: string): void => {
  if (conversationId) {
    localStorage.setItem(LAST_FEED_CONVERSATION_KEY, conversationId);
  }
};

export const getLastActiveFeedConversation = (): string | null => {
  const result = localStorage.getItem(LAST_FEED_CONVERSATION_KEY);
  return result;
};

export const clearLastActiveFeedConversation = (): void => {
  localStorage.removeItem(LAST_FEED_CONVERSATION_KEY);
};
