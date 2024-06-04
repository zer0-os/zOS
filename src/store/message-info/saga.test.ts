import { expectSaga } from 'redux-saga-test-plan';
import * as matchers from 'redux-saga-test-plan/matchers';

import { openOverview, closeOverview } from './saga';
import { Stage, setSelectedMessageId, setStage } from './index';
import { getMessageReadReceipts } from '../../lib/chat';
import { resetConversationManagement } from '../group-management/saga';

describe('message-info saga', () => {
  const roomId = 'room-id';
  const messageId = 'message-id';

  describe('openOverview', () => {
    const receipts = [
      { userId: '@user-1:matrix.org', eventId: 'event-1', ts: 1620000000000 },
      { userId: '@user-2:matrix.org', eventId: 'event-2', ts: 1620000001000 },
      { userId: '@current-user-id:matrix.org', eventId: 'event-3', ts: 1620000002000 },
    ];

    it('sets the selected message ID', async () => {
      await expectSaga(openOverview, { payload: { roomId, messageId } })
        .provide([
          [matchers.call.fn(resetConversationManagement), undefined],
          [matchers.call.fn(getMessageReadReceipts), receipts],
        ])
        .put(setStage(Stage.Overview))
        .put(setSelectedMessageId(messageId))
        .run();
    });
  });

  describe('closeOverview', () => {
    it('clears the selected message ID', async () => {
      await expectSaga(closeOverview).put(setStage(Stage.None)).put(setSelectedMessageId('')).run();
    });
  });
});
