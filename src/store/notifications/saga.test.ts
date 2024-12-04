import { expectSaga } from 'redux-saga-test-plan';
import { call } from 'redux-saga/effects';

import { openNotificationConversation } from './saga';
import { getHistory } from '../../lib/browser';
import { openConversation } from '../channels/saga';

describe('notifications saga', () => {
  describe('openNotificationConversation', () => {
    it('opens conversation and navigates to the correct URL', async () => {
      const roomId = 'room-123';
      const mockHistory = {
        push: jest.fn(),
      };

      await expectSaga(openNotificationConversation, { payload: roomId })
        .provide([
          [call(openConversation, roomId), undefined],
          [call(getHistory), mockHistory],
        ])
        .call(openConversation, roomId)
        .call(getHistory)
        .run();

      expect(mockHistory.push).toHaveBeenCalledWith({
        pathname: `/conversation/${roomId}`,
      });
    });

    it('does not open conversation when roomId is empty', async () => {
      await expectSaga(openNotificationConversation, { payload: '' })
        .not.call(openConversation, '')
        .not.call(getHistory)
        .run();
    });

    it('handles errors when opening conversation', async () => {
      const roomId = 'room-123';
      const error = new Error('Failed to open conversation');
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

      await expectSaga(openNotificationConversation, { payload: roomId })
        .provide([[call(openConversation, roomId), Promise.reject(error)]])
        .call(openConversation, roomId)
        .run();

      expect(consoleSpy).toHaveBeenCalledWith('Error opening conversation:', error);
      consoleSpy.mockRestore();
    });
  });
});
