import { expectSaga } from 'redux-saga-test-plan';
import * as matchers from 'redux-saga-test-plan/matchers';

import { setUser } from '.';
import {
  nonceOrAuthorize,
  terminate,
  getCurrentUserWithChatAccessToken,
  initializeUserState,
  clearUserState,
  processUserAccount,
} from './saga';
import {
  nonceOrAuthorize as nonceOrAuthorizeApi,
  fetchCurrentUser,
  clearSession as clearSessionApi,
  fetchChatAccessToken,
} from './api';
import { reducer } from '.';
import { setChatAccessToken } from '../chat';
import { fetch as fetchNotifications } from '../notifications';
import { receive, SagaActionTypes as ChannelsListSagaActionTypes } from '../channels-list';
import { update } from '../layout';
import { rootReducer } from '../index';
import { clearNotifications } from '../notifications/saga';
import { clearChannelsAndConversations } from '../channels-list/saga';
import { clearUserLayout } from '../layout/saga';

const authorizationResponse = {
  accessToken: 'eyJh-access-token',
  chatAccessToken: 'chat-access-token',
};

const nonceResponse = {
  nonceToken: 'expiring-nonce-token',
};

const currentUserResponse = {
  userId: 'id-1',
  id: 'id-1',
};

const chatAccessTokenResponse = {
  chatAccessToken: 'abc-a123',
};

describe('authentication saga', () => {
  const signedWeb3Token = '0x000000000000000000000000000000000000000A';

  it('nonceOrAuthorize with accessToken', async () => {
    await expectSaga(nonceOrAuthorize, { payload: { signedWeb3Token } })
      .provide([
        [
          matchers.call.fn(nonceOrAuthorizeApi),
          authorizationResponse,
        ],
        [
          matchers.call.fn(fetchCurrentUser),
          currentUserResponse,
        ],
      ])
      .call(nonceOrAuthorizeApi, signedWeb3Token)
      .put(setUser({ data: currentUserResponse, nonce: null, isLoading: false }))
      .put(setChatAccessToken({ value: authorizationResponse.chatAccessToken, isLoading: false }))
      .put({ type: ChannelsListSagaActionTypes.StartChannelsAndConversationsAutoRefresh })
      .run();
  });

  it('nonceOrAuthorize with nonceToken', async () => {
    await expectSaga(nonceOrAuthorize, { payload: { signedWeb3Token } })
      .provide([
        [
          matchers.call.fn(nonceOrAuthorizeApi),
          nonceResponse,
        ],
      ])
      .call(nonceOrAuthorizeApi, signedWeb3Token)
      .put(setUser({ nonce: nonceResponse.nonceToken, isLoading: false }))
      .put(setChatAccessToken({ value: null, isLoading: true }))
      .run();
  });

  describe('terminate', () => {
    it('verifies terminate orchestration', async () => {
      await expectSaga(terminate)
        .provide([
          [
            matchers.call.fn(clearSessionApi),
            true,
          ],
        ])
        .call(clearSessionApi)
        .put(setUser({ data: null, isLoading: false, nonce: null }))
        .put(setChatAccessToken({ value: null, isLoading: false }))
        .put({ type: ChannelsListSagaActionTypes.StopChannelsAndConversationsAutoRefresh })
        .withReducer(rootReducer)
        .run();
    });

    it('clears the user state', async () => {
      await expectSaga(terminate)
        .provide([
          [
            matchers.call.fn(clearSessionApi),
            true,
          ],
        ])
        .spawn(clearUserState)
        .withReducer(rootReducer)
        .run();
    });
  });

  describe('getCurrentUserWithChatAccessToken', () => {
    it('stores user', async () => {
      const { storeState } = await expectSaga(getCurrentUserWithChatAccessToken)
        .provide([
          [
            matchers.call.fn(fetchCurrentUser),
            currentUserResponse,
          ],
          [
            matchers.call.fn(fetchChatAccessToken),
            chatAccessTokenResponse,
          ],
        ])
        .withReducer(reducer)
        .run();

      expect(storeState).toMatchObject({
        user: {
          data: currentUserResponse,
          isLoading: false,
        },
      });
    });

    it('initializes the user state', async () => {
      await expectSaga(getCurrentUserWithChatAccessToken)
        .provide([
          [
            matchers.call.fn(fetchCurrentUser),
            currentUserResponse,
          ],
          [
            matchers.call.fn(fetchChatAccessToken),
            chatAccessTokenResponse,
          ],
        ])
        .spawn(initializeUserState, currentUserResponse)
        .run();
    });

    it('fetch notification', async () => {
      await expectSaga(getCurrentUserWithChatAccessToken)
        .provide([
          [
            matchers.call.fn(fetchCurrentUser),
            currentUserResponse,
          ],
          [
            matchers.call.fn(fetchChatAccessToken),
            chatAccessTokenResponse,
          ],
        ])
        .spawn(initializeUserState, currentUserResponse)
        .put(fetchNotifications({ userId: currentUserResponse.id }))
        .run();
    });
  });

  describe('processUserAccount', () => {
    it('process user account when loading', async () => {
      await expectSaga(processUserAccount, { user: null, isLoading: true })
        .not.spawn(clearUserState)
        .not.put({ type: ChannelsListSagaActionTypes.StopChannelsAndConversationsAutoRefresh })
        .run();
    });

    it('process user account without a user when loaded', async () => {
      await expectSaga(processUserAccount, { user: null, isLoading: false })
        .spawn(clearUserState)
        .put({ type: ChannelsListSagaActionTypes.StopChannelsAndConversationsAutoRefresh })
        .withReducer(rootReducer)
        .run();
    });

    it('process user account with user when loaded', async () => {
      const user = { id: 'anything' } as any;
      await expectSaga(processUserAccount, { user, isLoading: false })
        .spawn(initializeUserState, user)
        .put({ type: ChannelsListSagaActionTypes.StartChannelsAndConversationsAutoRefresh })
        .withReducer(rootReducer)
        .run();
    });
  });

  describe('clearUserState', () => {
    it('resets layout', async () => {
      await expectSaga(clearUserState)
        .put(update({ isSidekickOpen: false }))
        .put(receive([]))
        .withReducer(rootReducer)
        .run();
    });

    it('resets channels and conversations state', async () => {
      const channelId = 'channel-id';

      const initialState = {
        normalized: {
          channels: {
            [channelId]: {
              id: channelId,
            },
          },
        },
        channelsList: { value: [channelId] },
        notificationsList: { value: [] },
      };

      const {
        storeState: {
          normalized: { channels },
          channelsList,
        },
      } = await expectSaga(clearUserState)
        .provide([
          [
            matchers.call.fn(clearUserLayout),
            [],
          ],
          [
            matchers.call.fn(clearNotifications),
            [],
          ],
        ])
        .withReducer(rootReducer, initialState as any)
        .run();

      expect(channelsList.value).toEqual([]);
      expect(channels).toEqual({});
    });

    it('resets notifications state', async () => {
      const notificationId = 'notification-id';

      const initialState = {
        normalized: {
          notifications: {
            [notificationId]: {
              id: notificationId,
            },
          },
        },
        notificationsList: { value: [notificationId] },
        channelsList: { value: [] },
      };

      const {
        storeState: {
          normalized: { notifications },
          notificationsList,
        },
      } = await expectSaga(clearUserState)
        .provide([
          [
            matchers.call.fn(clearUserLayout),
            [],
          ],
          [
            matchers.call.fn(clearChannelsAndConversations),
            [],
          ],
        ])
        .withReducer(rootReducer, initialState as any)
        .run();

      expect(notificationsList.value).toEqual([]);
      expect(notifications).toEqual({});
    });
  });
});
