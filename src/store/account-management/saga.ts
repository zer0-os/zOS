import { call, put, select, spawn, take, takeLeading } from 'redux-saga/effects';

import {
  Errors,
  SagaActionTypes,
  setAddEmailAccountModalStatus,
  setErrors,
  setState,
  setSuccessMessage,
  State,
  setAddWalletRequiresTransferConfirmation,
} from '.';

import { addEmailAccount } from '../registration/saga';
import { currentUserSelector } from '../authentication/selectors';
import { setUser } from '../authentication';
import cloneDeep from 'lodash/cloneDeep';
import { Events as AuthEvents, getAuthChannel } from '../authentication/channels';
import { getSignedToken } from '../web3/saga';
import {
  linkNewWalletToZEROAccount as apiLinkNewWalletToZEROAccount,
  LinkNewWalletToZEROAccountResponse,
  removeWallet as apiRemoveWallet,
  getWallets as apiGetWallets,
} from './api';
import { fetchCurrentUser } from '../authentication/api';

export function* reset() {
  yield put(setState(State.NONE));
  yield put(setErrors([]));
  yield put(setSuccessMessage(''));
}

export function* linkNewWalletToZEROAccount() {
  yield call(reset);

  yield put(setState(State.INPROGRESS));
  try {
    let result = yield call(getSignedToken);
    if (!result.success) {
      yield put(setErrors([result.error]));
      return;
    }
    const canAuthenticate = yield select((s) => s.accountManagement.addWalletCanAuthenticate);
    const apiResult: LinkNewWalletToZEROAccountResponse = yield call(apiLinkNewWalletToZEROAccount, result.token, {
      canAuthenticate,
    });
    if (apiResult.success) {
      // Special success body requiring confirmation
      if (
        (apiResult as any)?.response?.code === 'WALLET_LINKED_TO_ANOTHER_ACCOUNT' &&
        (apiResult as any)?.response?.requiresConfirmation
      ) {
        yield put(setAddWalletRequiresTransferConfirmation(true));
        return;
      }

      yield call(fetchWallets);
      yield call(refreshCurrentUser);
      yield put(setSuccessMessage('Wallet added successfully'));
    } else {
      if (apiResult.response === 'WALLET_IN_USE_AND_REQUIRED') {
        yield put(
          setErrors([
            'This wallet is the only login method on another account. Log into that account with this wallet, add another login method (e.g., email or a different wallet), then return here to link it.',
          ])
        );
      } else {
        yield put(setErrors([apiResult.error]));
      }
      return;
    }
  } catch (e) {
    yield put(setErrors([Errors.UNKNOWN_ERROR]));
  } finally {
    const requiresTransfer = yield select((s) => s.accountManagement.addWalletRequiresTransferConfirmation);
    if (requiresTransfer) {
      // Keep modal open for confirmation step
      yield put(setState(State.NONE));
    } else {
      yield put(setState(State.LOADED));
    }
  }

  return;
}

export function* confirmAddNewWallet() {
  yield call(reset);
  yield put(setState(State.INPROGRESS));
  try {
    let result = yield call(getSignedToken);
    if (!result.success) {
      yield put(setErrors([result.error]));
      return;
    }

    const canAuthenticate = yield select((s) => s.accountManagement.addWalletCanAuthenticate);
    const apiResult: LinkNewWalletToZEROAccountResponse = yield call(apiLinkNewWalletToZEROAccount, result.token, {
      confirm: true,
      canAuthenticate,
    });
    if (apiResult.success) {
      yield call(fetchWallets);
      yield call(refreshCurrentUser);
      yield put(setSuccessMessage('Wallet added successfully'));
      yield put(setAddWalletRequiresTransferConfirmation(false));
    } else {
      if (apiResult.response === 'WALLET_IN_USE_AND_REQUIRED') {
        yield put(
          setErrors([
            'This wallet is the only login method on another account. Log into that account with this wallet, add another login method (e.g., email or a different wallet), then return here to link it.',
          ])
        );
      } else {
        yield put(setErrors([apiResult.error]));
      }
      return;
    }
  } catch (e: any) {
    const message = e?.response?.body?.message || Errors.UNKNOWN_ERROR;
    yield put(setErrors([message]));
  } finally {
    yield put(setState(State.LOADED));
  }
}

export function* removeWallet(action) {
  const { walletId } = action.payload;
  // Open confirmation modal and store wallet id
  yield put({ type: SagaActionTypes.SetRemoveWalletModalStatus, payload: true });
  yield put({ type: SagaActionTypes.SetWalletIdPendingRemoval, payload: walletId });
  yield put({ type: SagaActionTypes.SetRemoveRequiresTransferConfirmation, payload: false });
  yield put({ type: SagaActionTypes.SetErrors, payload: [] });
  yield put({ type: SagaActionTypes.SetSuccessMessage, payload: '' });
}

export function* confirmRemoveWallet(action) {
  const { confirm } = action.payload || {};
  const state = yield select((s) => s.accountManagement);
  const walletId = state.walletIdPendingRemoval;
  if (!walletId) {
    return;
  }

  yield put({ type: SagaActionTypes.SetIsRemovingWallet, payload: true });
  try {
    const apiResult = yield call(apiRemoveWallet, walletId, confirm ? { confirm: true } : undefined);
    if (apiResult.success) {
      // Check for special 200 response requiring confirmation
      if (apiResult.response?.code === 'WALLET_LINKED_TO_ANOTHER_ACCOUNT' && apiResult.response?.requiresConfirmation) {
        yield put({ type: SagaActionTypes.SetRemoveRequiresTransferConfirmation, payload: true });
        return;
      }

      // Success path: refresh wallets and show success message
      yield call(fetchWallets);
      yield call(refreshCurrentUser);
      yield put(setSuccessMessage('Wallet removed successfully'));
      // Close modal and clear
      yield put({ type: SagaActionTypes.SetRemoveWalletModalStatus, payload: false });
      yield put({ type: SagaActionTypes.SetWalletIdPendingRemoval, payload: undefined });
      yield put({ type: SagaActionTypes.SetRemoveRequiresTransferConfirmation, payload: false });
    } else {
      if (apiResult.response === 'CANNOT_REMOVE_ONLY_AUTH_METHOD') {
        yield put(
          setErrors([
            'This wallet is the only login method on this account. Add another login method (e.g., email or a different wallet), in order to remove it.',
          ])
        );
      } else {
        yield put(setErrors([apiResult.error]));
      }
    }
  } catch (e: any) {
    const message = e?.response?.body?.message || 'UNKNOWN_ERROR';
    yield put(setErrors([message]));
  } finally {
    yield put({ type: SagaActionTypes.SetIsRemovingWallet, payload: false });
  }
}

export function* closeRemoveWalletModal() {
  yield put({ type: SagaActionTypes.SetRemoveWalletModalStatus, payload: false });
  yield put({ type: SagaActionTypes.SetWalletIdPendingRemoval, payload: undefined });
  yield put({ type: SagaActionTypes.SetRemoveRequiresTransferConfirmation, payload: false });
  yield put({ type: SagaActionTypes.SetIsRemovingWallet, payload: false });
}

export function* updateCurrentUserPrimaryEmail(email) {
  let currentUser = cloneDeep(yield select(currentUserSelector));
  currentUser.profileSummary = {
    ...currentUser.profileSummary,
    primaryEmail: email,
  };

  yield put(setUser({ data: currentUser }));
}

export function* addEmailToZEROAccount(action) {
  const { email, password } = action.payload;
  yield call(reset);

  const result = yield call(addEmailAccount, { email, password });
  if (result && result.success) {
    yield call(updateCurrentUserPrimaryEmail, email);
    yield call(closeAddEmailAccountModal);
    yield put(setSuccessMessage('Email added successfully'));
  }

  return;
}

export function* openAddEmailAccountModal() {
  yield put(setAddEmailAccountModalStatus(true));
}

export function* closeAddEmailAccountModal() {
  yield put(setAddEmailAccountModalStatus(false));
}

function* listenForUserLogout() {
  const userChannel = yield call(getAuthChannel);
  while (true) {
    yield take(userChannel, AuthEvents.UserLogout);
    yield call(reset);
  }
}

export function* saga() {
  yield spawn(listenForUserLogout);

  yield takeLeading(SagaActionTypes.AddNewWallet, linkNewWalletToZEROAccount);
  yield takeLeading(SagaActionTypes.ConfirmAddNewWallet, confirmAddNewWallet);
  yield takeLeading(SagaActionTypes.AddEmailAccount, addEmailToZEROAccount);

  yield takeLeading(SagaActionTypes.OpenAddEmailAccountModal, openAddEmailAccountModal);
  yield takeLeading(SagaActionTypes.CloseAddEmailAccountModal, closeAddEmailAccountModal);
  yield takeLeading(SagaActionTypes.Reset, reset);
  yield takeLeading(SagaActionTypes.RemoveWallet, removeWallet);
  yield takeLeading(SagaActionTypes.ConfirmRemoveWallet, confirmRemoveWallet);
  yield takeLeading(SagaActionTypes.CloseRemoveWalletModal, closeRemoveWalletModal);
  yield takeLeading(SagaActionTypes.FetchWallets, fetchWallets);
}

export function* fetchWallets() {
  try {
    const result = yield call(apiGetWallets);
    if (result.success) {
      yield put({ type: SagaActionTypes.SetWallets, payload: result.response.wallets || [] });
    } else {
      yield put(setErrors([result.error]));
    }
  } catch (e: any) {
    const message = e?.response?.body?.message || Errors.UNKNOWN_ERROR;
    yield put(setErrors([message]));
  }
}

export function* refreshCurrentUser() {
  const result = yield call(fetchCurrentUser);
  if (result) {
    yield put(setUser({ data: result }));
  }
}
