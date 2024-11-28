import { takeLatest, call, put, select } from 'redux-saga/effects';
import { SagaActionTypes, setNotifications, setLoading, setError } from '.';
import { openConversation } from '../channels/saga';
import { getNotifications } from '../../lib/chat';
import { getHistory } from '../../lib/browser';
import { mapNotificationSenders } from '../messages/utils.matrix';

export function* fetchNotifications() {
  try {
    yield put(setLoading(true));

    const NOTIFICATION_LIMIT = 50;
    const CUTOFF_DAYS = 30;
    const CUTOFF_TIMESTAMP = Date.now() - CUTOFF_DAYS * 24 * 60 * 60 * 1000;

    // First check existing notifications in state
    const existingNotifications = yield select((state) => state.notifications.items);
    if (existingNotifications?.length > 0) {
      const recentNotifications = existingNotifications.filter((n) => n.createdAt > CUTOFF_TIMESTAMP);
      if (recentNotifications.length >= NOTIFICATION_LIMIT) {
        yield put(setNotifications(recentNotifications.slice(0, NOTIFICATION_LIMIT)));
        return;
      }
    }

    // If we don't have enough recent notifications, fetch new ones
    const notifications = yield call(getNotifications);
    const notificationsWithSenders = yield call(mapNotificationSenders, notifications);

    const sortedNotifications = notificationsWithSenders
      .filter((n) => n.createdAt > CUTOFF_TIMESTAMP)
      .sort((a, b) => b.createdAt - a.createdAt)
      .slice(0, NOTIFICATION_LIMIT);

    yield put(setNotifications(sortedNotifications));
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
