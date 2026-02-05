import { takeLatest, select, put, call, fork, take } from 'redux-saga/effects';
import {
  nextStage,
  previousStage,
  SendStage,
  setSendStage,
  setRecipient,
  setAmount,
  setToken,
  setNft,
  setTxReceipt,
  transferToken,
  transferNft,
  setSelectedWallet,
  setError,
  reset,
  setErrorCode,
} from '.';
import {
  recipientSelector,
  sendStageSelector,
  amountSelector,
  tokenSelector,
  nftSelector,
  selectedWalletAddressSelector,
} from './selectors';
import { queryClient } from '../../lib/web3/rainbowkit/provider';
import { transferTokenRequest, TransferTokenResponse } from '../../apps/wallet/queries/transferTokenRequest';
import { txReceiptQueryOptions, TxReceiptResponse } from '../../apps/wallet/queries/txReceiptQueryOptions';
import { setUser } from '../authentication';
import { NFT, Recipient, TokenBalance } from '../../apps/wallet/types';
import { transferNFTRequest, TransferNFTResponse } from '../../apps/wallet/queries/transferNFTRequest';
import {
  transferNativeAssetRequest,
  TransferNativeAssetResponse,
} from '../../apps/wallet/queries/transferNativeAssetRequest';
import { isWalletAPIError } from './utils';

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
    const address = action.payload.data?.zeroWalletAddress;

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
        let result: TransferTokenResponse | TransferNativeAssetResponse;
        if (token.tokenAddress === 'native') {
          result = yield call(() =>
            transferNativeAssetRequest(selectedWallet, recipient.publicAddress, amount, token.chainId)
          );
        } else {
          result = yield call(() =>
            transferTokenRequest(selectedWallet, recipient.publicAddress, amount, token.tokenAddress, token.chainId)
          );
        }

        if (result.transactionHash) {
          yield put(setSendStage(SendStage.Broadcasting));
          const receipt: TxReceiptResponse = yield call(() =>
            queryClient.fetchQuery(txReceiptQueryOptions(result.transactionHash, token.chainId))
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
    if (isWalletAPIError(e)) {
      yield put(setErrorCode(e.response.body.code));
    }
    yield put(setError(true));
  }
}

function* handleNext() {
  const stage: SendStage = yield select(sendStageSelector);
  const nft: NFT | null = yield select(nftSelector);

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
      if (nft) {
        // NFT selected - skip Amount, go straight to Confirm
        yield put(setSendStage(SendStage.Confirm));
      } else if (token) {
        // Token selected - go to Amount
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
  const nft: NFT | null = yield select(nftSelector);

  switch (stage) {
    case SendStage.Confirm:
      if (nft) {
        // NFT flow - go back to Token selection (skip Amount)
        yield put(setNft(null));
        yield put(setSendStage(SendStage.Token));
      } else {
        // Token flow - go back to Amount
        yield put(setAmount(null));
        yield put(setSendStage(SendStage.Amount));
      }
      break;
    case SendStage.Amount:
      yield put(setToken(null));
      yield put(setSendStage(SendStage.Token));
      break;
    case SendStage.Token:
      yield put(setRecipient(null));
      yield put(setNft(null));
      yield put(setToken(null));
      yield put(setSendStage(SendStage.Search));
      break;
    case SendStage.Search:
      // Can't go back from search
      break;
  }
}

function* handleTransferNft() {
  const stage: SendStage = yield select(sendStageSelector);

  try {
    if (stage === SendStage.Confirm) {
      const recipient: Recipient = yield select(recipientSelector);
      const selectedWallet: string | undefined = yield select(selectedWalletAddressSelector);
      const nft: NFT = yield select(nftSelector);

      if (recipient && nft && selectedWallet) {
        yield put(setSendStage(SendStage.Processing));

        const result: TransferNFTResponse = yield call(() =>
          transferNFTRequest(selectedWallet, recipient.publicAddress, nft.id, nft.collectionAddress)
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
    if (isWalletAPIError(e)) {
      yield put(setErrorCode(e.response.body.code));
    }
    yield put(setError(true));
    yield put(setSendStage(SendStage.Error));
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
  yield takeLatest(transferNft.type, handleTransferNft);
}
