import { type Account } from 'thirdweb/wallets';

class ThirdwebAccountManager {
  private static instance: ThirdwebAccountManager;
  private accountInstance: Account | null = null;

  private constructor() {}

  static getInstance(): ThirdwebAccountManager {
    if (!ThirdwebAccountManager.instance) {
      ThirdwebAccountManager.instance = new ThirdwebAccountManager();
    }
    return ThirdwebAccountManager.instance;
  }

  setAccount(account: Account) {
    this.accountInstance = account;
  }

  getAccount(): Account | null {
    return this.accountInstance;
  }

  isConnected(): boolean {
    return this.accountInstance !== null;
  }
}

export const accountManager = ThirdwebAccountManager.getInstance();

export function useThirdwebAccount(): Account | null {
  return accountManager.getAccount();
}
