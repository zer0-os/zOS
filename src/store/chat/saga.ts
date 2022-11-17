import { takeLatest, put, call } from 'redux-saga/effects';
import { SagaActionTypes, setChatAccessToken, setReconnecting } from '.';
import { fetchChatAccessToken } from './api';

export function* getChatAccessToken() {
  yield put(setChatAccessToken({ value: '', isLoading: true }));
  const response = yield call(fetchChatAccessToken);

  yield put(
    setChatAccessToken({
      value: response.chatAccessToken,
      isLoading: false,
    })
  );
}
export function* receiveIsReconnecting(action) {
  yield put(setReconnecting(action.payload));
}

export function* saga() {
  yield takeLatest(SagaActionTypes.FetchChatAccessToken, getChatAccessToken);
  yield takeLatest(SagaActionTypes.ReceiveIsReconnecting, receiveIsReconnecting);
}
