import { del, get, post } from '../../lib/api/rest';
import { Wallet } from '../authentication/types';

export interface LinkNewWalletToZEROAccountResponse {
  success: boolean;
  response:
    | {
        wallet: Wallet;
        primaryZID?: string;
      }
    | string;
  error?: string;
}

export async function linkNewWalletToZEROAccount(
  token: string,
  options?: { confirm?: boolean; canAuthenticate?: boolean }
): Promise<LinkNewWalletToZEROAccountResponse> {
  try {
    const response = await post('/api/v2/accounts/add-wallet').send({
      web3Token: token,
      ...(options?.confirm ? { confirm: options.confirm } : {}),
      canAuthenticate: options.canAuthenticate,
    });
    return {
      success: true,
      response: response.body,
    };
  } catch (error: any) {
    if (error?.response?.status === 400) {
      return {
        success: false,
        response: error.response.body.code,
        error: error.response.body.message,
      };
    }
    throw error;
  }
}

export async function removeWallet(
  walletId: string,
  options?: { confirm?: boolean }
): Promise<{ success: boolean; response: any; error?: string }> {
  try {
    const request = del(`/api/v2/accounts/wallets/${walletId}`);
    const response = options?.confirm ? await request.send({ confirm: true }) : await request;
    return {
      success: true,
      response: response.body,
    };
  } catch (error: any) {
    if (error?.response?.status === 400) {
      return {
        success: false,
        response: error.response.body.code,
        error: error.response.body.message,
      };
    }
    throw error;
  }
}

export async function getWallets(): Promise<{ success: boolean; response: Wallet[]; error?: string }> {
  try {
    const response = await get('/api/v2/accounts/wallets');
    return {
      success: true,
      response: response.body,
    };
  } catch (error: any) {
    if (error?.response?.status === 400) {
      return {
        success: false,
        response: [],
        error: error.response.body.message,
      };
    }
    throw error;
  }
}
