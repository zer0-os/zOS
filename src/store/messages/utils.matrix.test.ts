import { expectSaga } from 'redux-saga-test-plan';
import * as matchers from 'redux-saga-test-plan/matchers';

import { mapMessageSenders } from './utils.matrix';
import { getZEROUsers } from '../channels-list/api';
import { chat } from '../../lib/chat';

const chatClient = { getMessageByRoomId: () => {} };

describe(mapMessageSenders, () => {
  let messages: any;
  let users: any;

  beforeEach(() => {
    users = [
      {
        userId: 'user-1',
        matrixId: 'matrix-user-1',
        firstName: 'Test',
        lastName: 'User 1',
        profileImage: 'image-url-1',
      },
      {
        userId: 'user-2',
        matrixId: 'matrix-user-2',
        firstName: 'Test',
        lastName: 'User 2',
        profileImage: 'image-url-2',
      },
    ];

    messages = [
      { id: 1, message: 'message-1', sender: { userId: 'matrix-user-1', firstName: '' } },
      { id: 2, message: 'message-2', sender: { userId: 'matrix-user-2', firstName: '' } },
    ];
  });

  it('calls getZEROUsersAPI with matrixIds if users are not present in local redux state', async () => {
    const initialState = {
      normalized: {
        users: {
          'user-1': users[0],
        },
      },
    };

    await expectSaga(mapMessageSenders, messages, 'channel-id')
      .withState(initialState)
      .call(getZEROUsers, ['matrix-user-2'])
      .run();
  });

  it('maps message senders to ZERO users if present in state', async () => {
    const initialState = {
      normalized: {
        users: {
          'user-1': users[0],
          'user-2': users[1],
        },
      },
    };

    await expectSaga(mapMessageSenders, messages, 'channel-id').withState(initialState).run();

    expect(messages[0].sender).toEqual({
      userId: 'user-1',
      matrixId: 'matrix-user-1',
      firstName: 'Test',
      lastName: 'User 1',
      profileImage: 'image-url-1',
    });
    expect(messages[1].sender).toEqual({
      userId: 'user-2',
      matrixId: 'matrix-user-2',
      firstName: 'Test',
      lastName: 'User 2',
      profileImage: 'image-url-2',
    });
  });

  it('sets the parentMessage to message if present in state', async () => {
    const initialState = {
      normalized: {
        users: {
          'user-1': users[0],
          'user-2': users[1],
        },
      },
    };

    const parentMessage = messages[0];
    messages[1].parentMessageId = parentMessage.id; // make 2nd message in the list a reply to the first

    await expectSaga(mapMessageSenders, messages, 'channel-id').withState(initialState).run();

    expect(messages[1].parentMessage).toEqual(messages[0]); // check if the parent message is assigned properly
  });

  it('calls matrix API to fetch parent message if not present in state', async () => {
    const initialState = {
      normalized: {
        users: {
          'user-1': users[0],
          'user-2': users[1],
        },
      },
    };

    const oldMessage = {
      id: 'some-very-old-message-id',
      sender: { userId: 'matrix-user-1', firstName: '' },
      message: 'parent message',
    };
    messages[1].parentMessageId = oldMessage.id; // 2nd message's parent is a very old message (so not present in current list)

    await expectSaga(mapMessageSenders, messages, 'channel-id')
      .provide([
        [matchers.call.fn(chat.get), chatClient],
        [matchers.call.fn(chatClient.getMessageByRoomId), oldMessage],
      ])
      .withState(initialState)
      .call(chat.get)
      .call([chatClient, chatClient.getMessageByRoomId], 'channel-id', 'some-very-old-message-id')
      .run();

    expect(messages[1].parentMessage).toEqual({
      id: 'some-very-old-message-id',
      // parent message's sender is also mapped to a ZERO user
      sender: {
        userId: 'user-1',
        matrixId: 'matrix-user-1',
        firstName: 'Test',
        lastName: 'User 1',
        profileImage: 'image-url-1',
      },
      message: 'parent message',
    });
  });
});
