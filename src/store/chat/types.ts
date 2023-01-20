export interface ChatState {
  isReconnecting: boolean;
  chatAccessToken: {
    value: string;
    isLoading: boolean;
  };
  activeChannelId: string;
}

export interface ChatAccessTokenResponse {
  chatAccessToken: string;
  accountCreated: boolean;
}
