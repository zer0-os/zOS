import { takeLatest, call, select } from 'redux-saga/effects';
import { SagaActionTypes } from '.';
import { openConversation, rawChannelSelector } from '../channels/saga';
import { getHistory } from '../../lib/browser';
import { getAliasForRoomId } from '../../lib/chat';

export function* openNotificationConversation(action) {
  const roomId = action.payload;

  try {
    if (!roomId) {
      return;
    }

    const channel = yield select(rawChannelSelector(roomId));

    if (channel?.isSocialChannel) {
      const zid = yield call(getAliasForRoomId, roomId);

      if (zid) {
        const history = yield call(getHistory);
        history.push({ pathname: `/feed/${zid}` });
      } else {
        console.error('Could not find ZID for social channel:', roomId);
      }
    } else {
      yield call(openConversation, roomId);
      const history = yield call(getHistory);
      history.push({ pathname: `/conversation/${roomId}` });
    }
  } catch (error) {
    console.error('Error opening conversation:', error);
  }
}

export function* saga() {
  yield takeLatest(SagaActionTypes.OpenNotificationConversation, openNotificationConversation);
}
