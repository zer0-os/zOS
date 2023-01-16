export interface ChatState {
  isReconnecting: boolean;
  chatAccessToken: {
    value: string;
    isLoading: boolean;
  };
}

export interface ChatAccessTokenResponse {
  chatAccessToken: string;
  accountCreated: boolean;
}
