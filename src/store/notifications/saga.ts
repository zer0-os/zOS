import { takeLatest, call, put, select } from 'redux-saga/effects';
import { SagaActionTypes, setNotifications, setLoading, setError, markAsRead, setMostRecentTimestamp } from '.';
import { openConversation } from '../channels/saga';
import { getNotifications, setNotificationReadStatus } from '../../lib/chat';
import { getHistory } from '../../lib/browser';
import { mapNotificationSenders } from '../messages/utils.matrix';

function* markNotificationsAsReadSaga(action) {
  const roomId = action.payload;
  try {
    yield call(setNotificationReadStatus, roomId);
    yield put(markAsRead(roomId));
  } catch (error) {
    console.error('Error marking notifications as read:', error);
  }
}

const inProgress = { isFetching: false };
export function* fetchNotifications() {
  if (inProgress.isFetching) return;

  try {
    inProgress.isFetching = true;
    yield put(setLoading(true));

    const NOTIFICATION_LIMIT = 50;
    const CUTOFF_TIMESTAMP = Date.now() - 30 * 24 * 60 * 60 * 1000;

    const currentNotifications = yield select((state) => state.notifications.items);
    const mostRecentTimestamp = yield select((state) => state.notifications.mostRecentTimestamp);

    const notifications = yield call(getNotifications, mostRecentTimestamp);

    if (notifications.length !== currentNotifications.length) {
      // Check if there are any recent notifications to process
      const recentNotifications = notifications.filter((n) => n.createdAt > CUTOFF_TIMESTAMP);

      if (recentNotifications.length > 0) {
        const notificationsWithSenders = yield call(mapNotificationSenders, notifications);
        const combinedNotifications = [...currentNotifications, ...notificationsWithSenders];

        // Remove duplicates based on notification ID
        const uniqueNotifications = Array.from(
          new Map(combinedNotifications.map((notification) => [notification.id, notification])).values()
        );

        const sortedNotifications = uniqueNotifications
          .sort((a, b) => b.createdAt - a.createdAt)
          .slice(0, NOTIFICATION_LIMIT);

        yield put(setNotifications(sortedNotifications));
        yield put(setMostRecentTimestamp(sortedNotifications[0].createdAt));
      }
    }
  } catch (error: any) {
    console.error('Error fetching notifications:', error);
    yield put(setError(error.message));
  } finally {
    inProgress.isFetching = false;
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
  yield takeLatest(SagaActionTypes.MarkNotificationsAsRead, markNotificationsAsReadSaga);
}
