import { call, fork, put, take, takeLatest } from 'redux-saga/effects';

import { getMessageReadReceipts } from '../../lib/chat';
import { SagaActionTypes, Stage, setSelectedMessageId, setStage } from './index';
import { Events, getAuthChannel } from '../authentication/channels';
import { updateReadByUsers } from '../messages/saga';
import { resetConversationManagement } from '../group-management/saga';

function* authWatcher() {
  const channel = yield call(getAuthChannel);
  while (true) {
    yield take(channel, Events.UserLogout);
    yield call(closeOverview);
  }
}

export function* openOverview(action) {
  const { roomId, messageId } = action.payload;

  yield call(resetConversationManagement);
  yield put(setStage(Stage.Overview));
  yield put(setSelectedMessageId(messageId));

  const receipts = yield call(getMessageReadReceipts, roomId, messageId);

  yield call(updateReadByUsers, messageId, receipts);
}

export function* closeOverview() {
  yield put(setStage(Stage.None));
  yield put(setSelectedMessageId(''));
}

export function* saga() {
  yield fork(authWatcher);

  yield takeLatest(SagaActionTypes.OpenMessageInfo, openOverview);
  yield takeLatest(SagaActionTypes.CloseMessageInfo, closeOverview);
}
