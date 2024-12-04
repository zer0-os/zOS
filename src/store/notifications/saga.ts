import { takeLatest, call } from 'redux-saga/effects';
import { SagaActionTypes } from '.';
import { openConversation } from '../channels/saga';
import { getHistory } from '../../lib/browser';

export function* openNotificationConversation(action) {
  const roomId = action.payload;

  try {
    if (!roomId) {
      return;
    }

    yield call(openConversation, roomId);

    // Navigate to the correct URL format
    const history = yield call(getHistory);
    history.push({ pathname: `/conversation/${roomId}` });
  } catch (error) {
    console.error('Error opening conversation:', error);
  }
}

export function* saga() {
  yield takeLatest(SagaActionTypes.OpenNotificationConversation, openNotificationConversation);
}
