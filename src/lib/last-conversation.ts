const LAST_CONVERSATION_KEY = 'last-active-conversation';

export const setLastActiveConversation = (conversationId: string): void => {
  if (conversationId) {
    localStorage.setItem(LAST_CONVERSATION_KEY, conversationId);
  }
};

export const getLastActiveConversation = (): string | null => {
  return localStorage.getItem(LAST_CONVERSATION_KEY);
};

export const clearLastActiveConversation = (): void => {
  localStorage.removeItem(LAST_CONVERSATION_KEY);
};
