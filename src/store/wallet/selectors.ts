import { RootState } from '..';

export const walletSelector = (state: RootState) => state.wallet;
export const recipientSelector = (state: RootState) => state.wallet.recipient;
export const sendStageSelector = (state: RootState) => state.wallet.sendStage;
export const tokenSelector = (state: RootState) => state.wallet.token;
export const amountSelector = (state: RootState) => state.wallet.amount;
export const selectedWalletSelector = (state: RootState) => state.wallet.selectedWallet;
export const txReceiptSelector = (state: RootState) => state.wallet.txReceipt;
export const selectedWalletAddressSelector = (state: RootState) => state.wallet.selectedWallet?.address;
export const hasActiveWalletSelector = (state: RootState) => !!selectedWalletAddressSelector(state);
