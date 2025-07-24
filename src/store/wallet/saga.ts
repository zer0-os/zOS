import { takeLatest, select, put, call, fork, take } from 'redux-saga/effects';
import {
  nextStage,
  previousStage,
  SendStage,
  setSendStage,
  setRecipient,
  setAmount,
  setToken,
  setTxReceipt,
  transferToken,
  setSelectedWallet,
  setError,
  reset,
} from '.';
import {
  recipientSelector,
  sendStageSelector,
  amountSelector,
  tokenSelector,
  selectedWalletAddressSelector,
} from './selectors';
import { queryClient } from '../../lib/web3/rainbowkit/provider';
import { transferTokenRequest, TransferTokenResponse } from '../../apps/wallet/queries/transferTokenRequest';
import { txReceiptQueryOptions, TxReceiptResponse } from '../../apps/wallet/queries/txReceiptQueryOptions';
import { setUser } from '../authentication';
import { Recipient, TokenBalance } from '../../apps/wallet/types';

/**
 * Loads the user's ThirdWeb wallet address into the store once the user has been fetched from the API
 * This ensures that the active wallet is set by default for the user. If they don't have a ThirdWeb wallet,
 * then the wallet button won't be shown to them.
 */
function* initializeWalletSaga() {
  const existingAddress: string | undefined = yield select(selectedWalletAddressSelector);
  if (existingAddress) {
    return;
  }

  while (true) {
    const action = yield take(setUser.type);
    const address = action.payload.data?.wallets?.find((wallet) => wallet.isThirdWeb)?.publicAddress;

    if (address) {
      yield put(setSelectedWallet({ address, label: null }));
    }
    break;
  }
}

function* handleTransferToken() {
  const stage: SendStage = yield select(sendStageSelector);

  try {
    if (stage === SendStage.Confirm) {
      const recipient: Recipient = yield select(recipientSelector);
      const selectedWallet: string | undefined = yield select(selectedWalletAddressSelector);
      const token: TokenBalance = yield select(tokenSelector);
      const amount: string = yield select(amountSelector);

      if (recipient && token && amount && selectedWallet) {
        yield put(setSendStage(SendStage.Processing));
        const result: TransferTokenResponse = yield call(() =>
          transferTokenRequest(selectedWallet, recipient.publicAddress, amount, token.tokenAddress)
        );

        if (result.transactionHash) {
          yield put(setSendStage(SendStage.Broadcasting));
          const receipt: TxReceiptResponse = yield call(() =>
            queryClient.fetchQuery(txReceiptQueryOptions(result.transactionHash))
          );
          yield put(setTxReceipt(receipt));
          if (receipt.status === 'confirmed') {
            yield put(setSendStage(SendStage.Success));
          } else {
            yield put(setSendStage(SendStage.Error));
          }
        } else {
          yield put(setSendStage(SendStage.Error));
        }
      }
    }
  } catch (e) {
    console.error(e);
    yield put(setError(true));
  }
}

function* handleNext() {
  const stage: SendStage = yield select(sendStageSelector);

  switch (stage) {
    case SendStage.Search: {
      const recipient = yield select(recipientSelector);
      if (recipient) {
        yield put(setSendStage(SendStage.Token));
      }
      break;
    }
    case SendStage.Token: {
      const token = yield select(tokenSelector);
      if (token) {
        yield put(setSendStage(SendStage.Amount));
      }
      break;
    }
    case SendStage.Amount: {
      const amount = yield select(amountSelector);
      if (amount) {
        yield put(setSendStage(SendStage.Confirm));
      }
      break;
    }
  }
}

function* handlePrevious() {
  const stage: SendStage = yield select(sendStageSelector);

  switch (stage) {
    case SendStage.Confirm:
      yield put(setAmount(null));
      yield put(setSendStage(SendStage.Amount));
      break;
    case SendStage.Amount:
      yield put(setToken(null));
      yield put(setSendStage(SendStage.Token));
      break;
    case SendStage.Token:
      yield put(setRecipient(null));
      yield put(setSendStage(SendStage.Search));
      break;
    case SendStage.Search:
      // Can't go back from search
      break;
  }
}

export function* clearWallet() {
  yield put(setSelectedWallet({ address: '', label: null }));
  yield put(reset());
}

export function* saga() {
  yield fork(initializeWalletSaga);
  yield takeLatest(nextStage.type, handleNext);
  yield takeLatest(previousStage.type, handlePrevious);
  yield takeLatest(transferToken.type, handleTransferToken);
}
