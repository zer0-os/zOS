interface WalletAPIError {
  response: {
    body: {
      message: string;
      code: string;
    };
  };
}

export const isWalletAPIError = (error: any): error is WalletAPIError => {
  return error?.response?.body?.code;
};
