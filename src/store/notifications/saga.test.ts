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
    it('fetches and sets notifications successfully when no existing notifications', async () => {
      const mockNotifications = [
        { id: '1', content: 'notification 1', createdAt: Date.now() },
        { id: '2', content: 'notification 2', createdAt: Date.now() },
      ];

      const mockNotificationsWithSenders = [
        { id: '1', content: 'notification 1', sender: { id: 'sender1' }, createdAt: Date.now() },
        { id: '2', content: 'notification 2', sender: { id: 'sender2' }, createdAt: Date.now() },
      ];

      await expectSaga(fetchNotifications)
        .withState({
          notifications: {
            items: [],
            mostRecentTimestamp: 0,
          },
        })
        .provide([
          [call(getNotifications, 0), mockNotifications],
          [call(mapNotificationSenders, mockNotifications), mockNotificationsWithSenders],
        ])
        .put(setLoading(true))
        .call(getNotifications, 0)
        .call(mapNotificationSenders, mockNotifications)
        .put(setNotifications(mockNotificationsWithSenders))
        .put(setLoading(false))
        .run();
    });

    it('uses existing notifications if they are recent and sufficient', async () => {
      const now = Date.now();
      const existingNotifications = Array.from({ length: 51 }, (_, i) => ({
        id: `${i}`,
        content: `notification ${i}`,
        createdAt: now - i * 1000,
      }));

      await expectSaga(fetchNotifications)
        .withState({
          notifications: {
            items: existingNotifications,
            mostRecentTimestamp: 0,
          },
        })
        .provide([
          [call(getNotifications, 0), existingNotifications],
        ])
        .put(setLoading(true))
        .put(setLoading(false))
        .run();
    });

    it('handles errors when fetching notifications', async () => {
      const error = new Error('Failed to fetch notifications');
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

      await expectSaga(fetchNotifications)
        .withState({
          notifications: {
            items: [],
            mostRecentTimestamp: 0,
          },
        })
        .provide([[call(getNotifications, 0), Promise.reject(error)]])
        .put(setLoading(true))
        .put(setError(error.message))
        .put(setLoading(false))
        .run();

      expect(consoleSpy).toHaveBeenCalledWith('Error fetching notifications:', error);
      consoleSpy.mockRestore();
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
