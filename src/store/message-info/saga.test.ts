import { expectSaga } from 'redux-saga-test-plan';
import * as matchers from 'redux-saga-test-plan/matchers';

import { openOverview, closeOverview } from './saga';
import { Stage, setSelectedMessageId, setStage } from './index';
import { resetConversationManagement } from '../group-management/saga';
import { mapMessageReadByUsers } from '../messages/saga';

describe('message-info saga', () => {
  const roomId = 'room-id';
  const messageId = 'message-id';

  describe('openOverview', () => {
    it('sets the selected message ID and maps message readBy users', async () => {
      await expectSaga(openOverview, { payload: { roomId, messageId } })
        .provide([
          [matchers.call.fn(resetConversationManagement), undefined],
          [matchers.call.fn(mapMessageReadByUsers), undefined],
        ])
        .put(setStage(Stage.Overview))
        .put(setSelectedMessageId(messageId))
        .call(mapMessageReadByUsers, messageId, roomId)
        .run();
    });
  });

  describe('closeOverview', () => {
    it('clears the selected message ID', async () => {
      await expectSaga(closeOverview).put(setStage(Stage.None)).put(setSelectedMessageId('')).run();
    });
  });
});
