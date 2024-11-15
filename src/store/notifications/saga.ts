import { takeLatest, call, put } from 'redux-saga/effects';
import { SagaActionTypes, setNotifications, setLoading, setError } from '.';
import { openConversation } from '../channels/saga';
import { getNotifications } from '../../lib/chat';
import { getHistory } from '../../lib/browser';
import { mapNotificationSenders } from '../messages/utils.matrix';

export function* fetchNotifications() {
  try {
    yield put(setLoading(true));

    const notifications = yield call(getNotifications);
    const notificationsWithSenders = yield call(mapNotificationSenders, notifications);

    yield put(setNotifications(notificationsWithSenders));
  } catch (error: any) {
    console.error('Error fetching notifications:', error);
    yield put(setError(error.message));
  } finally {
    yield put(setLoading(false));
  }
}

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
  yield takeLatest(SagaActionTypes.FetchNotifications, fetchNotifications);
  yield takeLatest(SagaActionTypes.OpenNotificationConversation, openNotificationConversation);
}
