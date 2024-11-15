import { expectSaga } from 'redux-saga-test-plan';
import { call } from 'redux-saga/effects';

import { fetchNotifications, openNotificationConversation } from './saga';
import { setNotifications, setLoading, setError } from '.';
import { getNotifications } from '../../lib/chat';
import { getHistory } from '../../lib/browser';
import { openConversation } from '../channels/saga';
import { mapNotificationSenders } from '../messages/utils.matrix';

describe('notifications saga', () => {
  describe('fetchNotifications', () => {
    it('fetches and sets notifications successfully', async () => {
      const mockNotifications = [
        { id: '1', content: 'notification 1' },
        { id: '2', content: 'notification 2' },
      ];

      const mockNotificationsWithSenders = [
        { id: '1', content: 'notification 1', sender: { id: 'sender1' } },
        { id: '2', content: 'notification 2', sender: { id: 'sender2' } },
      ];

      await expectSaga(fetchNotifications)
        .provide([
          [call(getNotifications), mockNotifications],
          [call(mapNotificationSenders, mockNotifications), mockNotificationsWithSenders],
        ])
        .put(setLoading(true))
        .call(getNotifications)
        .call(mapNotificationSenders, mockNotifications)
        .put(setNotifications(mockNotificationsWithSenders))
        .put(setLoading(false))
        .run();
    });

    it('handles errors when fetching notifications', async () => {
      const error = new Error('Failed to fetch notifications');

      await expectSaga(fetchNotifications)
        .provide([[call(getNotifications), Promise.reject(error)]])
        .put(setLoading(true))
        .put(setError(error.message))
        .put(setLoading(false))
        .run();
    });
  });

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
