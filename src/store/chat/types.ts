export interface ChatState {
  isReconnecting: boolean;
  chatAccessToken: {
    value: string;
    isLoading: boolean;
  };
  activeDirectMessageId: string;
}

export interface ChatAccessTokenResponse {
  chatAccessToken: string;
  accountCreated: boolean;
}
