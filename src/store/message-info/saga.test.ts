import { expectSaga } from 'redux-saga-test-plan';
import { call } from 'redux-saga/effects';

import { openOverview, closeOverview } from './saga';
import { setSelectedMessageId } from './index';
import { getMessageReadReceipts } from '../../lib/chat';
import { updateReadByUsers } from '../messages/saga';

describe('message-info saga', () => {
  const roomId = 'room-id';
  const messageId = 'message-id';

  describe('openOverview', () => {
    const receipts = [
      { userId: '@user-1:matrix.org', eventId: 'event-1', ts: 1620000000000 },
      { userId: '@user-2:matrix.org', eventId: 'event-2', ts: 1620000001000 },
      { userId: '@current-user-id:matrix.org', eventId: 'event-3', ts: 1620000002000 },
    ];

    it('sets the selected message ID and updates the message readBy', async () => {
      await expectSaga(openOverview, { payload: { roomId, messageId } })
        .provide([
          [call(getMessageReadReceipts, roomId, messageId), receipts],
          [call(updateReadByUsers, messageId, receipts), undefined],
        ])
        .put(setSelectedMessageId(messageId))
        .call(getMessageReadReceipts, roomId, messageId)
        .call(updateReadByUsers, messageId, receipts)
        .run();
    });
  });

  describe('closeOverview', () => {
    it('clears the selected message ID', async () => {
      await expectSaga(closeOverview).put(setSelectedMessageId('')).run();
    });
  });
});
