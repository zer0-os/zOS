export interface ChatState {
  isReconnecting: boolean;
  chatAccessToken: {
    value: string;
    isLoading: boolean;
  };
  activeMessengerId: string;
}

export interface ChatAccessTokenResponse {
  chatAccessToken: string;
  accountCreated: boolean;
}
