import moment from 'moment';
import { AdminMessageType, MediaType, Message, MessageSendStatus } from '../../store/messages';
import { RootState } from '../../store/reducer';
import { StoreBuilder } from '../../store/test/store';
import { adminMessageText, getMessagePreview, map as mapMessage, previewDisplayDate } from './chat-message';

describe('sendbird events', () => {
  describe('mapMessage', () => {
    it('maps sendbird channel info received from event', () => {
      const rawSendbirdResponse = {
        _iid: 'su-3f487094-5ff1-4e5c-9302-451c622d292e',
        channelUrl: 'sendbird_group_channel_31029_6f063fff39f551d8ac68fe6d117a52033e292e32',
        channelType: 'group',
        messageId: 8728123760,
        parentMessageId: 8711115337,
        parentMessage: {
          _iid: 'su-3f487094-5ff1-4e5c-9302-451c622d292e',
          channelUrl: 'sendbird_group_channel_31029_6f063fff39f551d8ac68fe6d117a52033e292e32',
          channelType: 'group',
          messageId: 8711115337,
          parentMessageId: 0,
          parentMessage: null,
          silent: false,
          isOperatorMessage: false,
          messageType: 'user',
          data: '{"mentionedUsers":[]}',
          customType: '',
          mentionType: null,
          mentionedUsers: null,
          mentionedUserIds: null,
          mentionedMessageTemplate: '',
          threadInfo: null,
          reactions: [],
          metaArrays: [],
          ogMetaData: null,
          appleCriticalAlertOptions: null,
          createdAt: 1680168823635,
          updatedAt: 0,
          scheduledInfo: null,
          extendedMessage: {},
          _isContinuousMessages: false,
          _scheduledStatus: null,
          sender: {
            _iid: 'su-3f487094-5ff1-4e5c-9302-451c622d292e',
            userId: '1bc08a9b-6f5b-497f-9d0b-3cf47abe426a',
            nickname: '0x03D3...d161',
            plainProfileUrl:
              '{"profileImage":"https://res.cloudinary.com/fact0ry-dev/image/upload/v1623021589/zero-assets/avatars/pfp-16.jpg","firstName":"0x03D3...d161","lastName":"","profileId":"b52d1815-97db-45a7-8477-5b976e9eedde"}',
            requireAuth: false,
            metaData: {},
            connectionStatus: 'nonavailable',
            isActive: true,
            lastSeenAt: null,
            preferredLanguages: null,
            friendDiscoveryKey: null,
            friendName: null,
            role: 'none',
            isBlockedByMe: false,
          },
          reqId: '',
          replyToChannel: false,
          sendingStatus: 'succeeded',
          errorCode: 0,
          message: 'hi @[0xE883...5870 ](user:9bf99cf6-559e-46e8-ba73-07faed8747ac) ',
          messageParams: null,
          translations: {},
          translationTargetLanguages: [],
          messageSurvivalSeconds: -1,
          plugins: [],
          _poll: null,
        },
        silent: false,
        isOperatorMessage: false,
        messageType: 'user',
        data: '{"mentionedUsers":[]}',
        customType: '',
        mentionType: 'users',
        mentionedUsers: [],
        mentionedUserIds: [],
        mentionedMessageTemplate: '',
        threadInfo: null,
        reactions: [],
        metaArrays: [],
        ogMetaData: null,
        appleCriticalAlertOptions: null,
        createdAt: 1680691559605,
        updatedAt: 0,
        scheduledInfo: null,
        extendedMessage: {},
        _isContinuousMessages: false,
        _scheduledStatus: null,
        sender: {
          _iid: 'su-3f487094-5ff1-4e5c-9302-451c622d292e',
          userId: '1bc08a9b-6f5b-497f-9d0b-3cf47abe426a',
          nickname: '0x03D3...d161',
          plainProfileUrl:
            '{"profileImage":"https://res.cloudinary.com/fact0ry-dev/image/upload/v1623021589/zero-assets/avatars/pfp-16.jpg","firstName":"0x03D3...d161","lastName":"","profileId":"b52d1815-97db-45a7-8477-5b976e9eedde"}',
          requireAuth: false,
          metaData: {},
          connectionStatus: 'nonavailable',
          isActive: true,
          lastSeenAt: null,
          preferredLanguages: null,
          friendDiscoveryKey: null,
          friendName: null,
          role: 'none',
          isBlockedByMe: false,
          profileUrl:
            '{"profileImage":"https://res.cloudinary.com/fact0ry-dev/image/upload/v1623021589/zero-assets/avatars/pfp-16.jpg","firstName":"0x03D3...d161","lastName":"","profileId":"b52d1815-97db-45a7-8477-5b976e9eedde"}',
        },
        reqId: '',
        replyToChannel: false,
        sendingStatus: 'succeeded',
        errorCode: 0,
        message: 'test mention @[0xE883...5870 ](user:9bf99cf6-559e-46e8-ba73-07faed8747ac) with image',
        messageParams: null,
        translations: {},
        translationTargetLanguages: [],
        messageSurvivalSeconds: -1,
        plugins: [],
        _poll: null,
      };

      const mappedMessage = mapMessage(rawSendbirdResponse);

      expect(mappedMessage).toEqual(
        expect.objectContaining({
          id: 8728123760,
          message: 'test mention @[0xE883...5870 ](user:9bf99cf6-559e-46e8-ba73-07faed8747ac) with image',
          parentMessageText: 'hi @[0xE883...5870 ](user:9bf99cf6-559e-46e8-ba73-07faed8747ac) ',
          createdAt: 1680691559605,
          updatedAt: 0,
          sender: {
            userId: '1bc08a9b-6f5b-497f-9d0b-3cf47abe426a',
            firstName: '0x03D3...d161',
            lastName: '',
            profileImage:
              'https://res.cloudinary.com/fact0ry-dev/image/upload/v1623021589/zero-assets/avatars/pfp-16.jpg',
            profileId: 'b52d1815-97db-45a7-8477-5b976e9eedde',
          },
          mentionedUsers: [],
          hidePreview: false,
          image: undefined,
          media: undefined,
          isAdmin: false,
          admin: {},
        })
      );
    });

    it('maps an admin message', () => {
      const adminData = { type: 'some_type', meta: 'some meta' };
      const rawSendbirdResponse = {
        channelUrl: 'sendbird_group_channel_31029_6f063fff39f551d8ac68fe6d117a52033e292e32',
        channelType: 'group',
        messageId: 8728123760,
        messageType: 'admin',
        data: JSON.stringify({ admin: adminData }),
        message: 'some admin message',
      };

      const mappedMessage = mapMessage(rawSendbirdResponse);

      expect(mappedMessage).toEqual(
        expect.objectContaining({
          id: 8728123760,
          isAdmin: true,
          admin: adminData,
        })
      );
    });
  });
});

describe(adminMessageText, () => {
  const getState = (currentUserId: string, users = {}) => {
    return {
      authentication: {
        user: { data: { id: currentUserId } },
      },
      normalized: {
        users: { ...users },
      } as any,
    } as RootState;
  };

  it('returns default message if admin type unknown', () => {
    const state = getState('current-user', {});
    const adminText = adminMessageText({ message: 'some message', isAdmin: true, admin: {} } as Message, state);

    expect(adminText).toEqual('some message');
  });

  describe(AdminMessageType.JOINED_ZERO, () => {
    it('returns default message if users not found', () => {
      const state = getState('current-user', {});
      const adminText = adminMessageText(
        {
          message: 'some message',
          isAdmin: true,
          admin: { type: AdminMessageType.JOINED_ZERO, inviteeId: 'unknown-user-id' },
        } as Message,
        state
      );

      expect(adminText).toEqual('some message');
    });

    it('translates message if current user was invitee', () => {
      const state = getState('current-user', { 'inviter-id': { id: 'inviter-id', firstName: 'Courtney' } });
      const message = {
        message: 'some message',
        isAdmin: true,
        admin: { type: AdminMessageType.JOINED_ZERO, inviterId: 'inviter-id', inviteeId: 'current-user' },
      } as Message;

      const adminText = adminMessageText(message, state);

      expect(adminText).toEqual('You joined Courtney on Zero');
    });

    it('translates message if current user was inviter', () => {
      const state = getState('current-user', { 'invitee-id': { id: 'invitee-id', firstName: 'Julie' } });
      const message = {
        message: 'some message',
        isAdmin: true,
        admin: { type: AdminMessageType.JOINED_ZERO, inviteeId: 'invitee-id', inviterId: 'current-user' },
      } as Message;

      const adminText = adminMessageText(message, state);

      expect(adminText).toEqual('Julie joined you on Zero');
    });
  });

  describe(AdminMessageType.CONVERSATION_STARTED, () => {
    it('returns default message if admin user id not found', () => {
      const state = getState('current-user', {});
      const adminText = adminMessageText(
        {
          message: 'some message',
          isAdmin: true,
          admin: { type: AdminMessageType.CONVERSATION_STARTED, userId: 'unknown-user-id' },
        } as Message,
        state
      );

      expect(adminText).toEqual('some message');
    });

    it('translates message if current user id is not the admin user id', () => {
      const state = getState('current-user', { 'admin-user-id': { id: 'admin-user-id', firstName: 'Courtney' } });
      const message = {
        message: 'some message',
        isAdmin: true,
        admin: { type: AdminMessageType.CONVERSATION_STARTED, userId: 'admin-user-id' },
      } as Message;

      const adminText = adminMessageText(message, state);

      expect(adminText).toEqual('Courtney started the conversation');
    });

    it('translates message if current user id is the admin user id', () => {
      const state = getState('admin-user-id', { 'admin-user-id': { id: 'admin-user-id', firstName: 'Julie' } });
      const message = {
        message: 'some message',
        isAdmin: true,
        admin: { type: AdminMessageType.CONVERSATION_STARTED, userId: 'admin-user-id' },
      } as Message;

      const adminText = adminMessageText(message, state);

      expect(adminText).toEqual('You started the conversation');
    });
  });

  describe(AdminMessageType.MEMBER_LEFT_CONVERSATION, () => {
    it('returns default message if admin user id not found', () => {
      const state = getState('current-user', {});
      const adminText = adminMessageText(
        {
          message: 'some message',
          isAdmin: true,
          admin: { type: AdminMessageType.MEMBER_LEFT_CONVERSATION, userId: 'unknown-user-id' },
        } as Message,
        state
      );

      expect(adminText).toEqual('some message');
    });

    it('translates message if admin user id is found', () => {
      const state = getState('current-user', { 'admin-user-id': { id: 'admin-user-id', firstName: 'Courtney' } });
      const message = {
        message: 'some message',
        isAdmin: true,
        admin: { type: AdminMessageType.MEMBER_LEFT_CONVERSATION, userId: 'admin-user-id' },
      } as Message;

      const adminText = adminMessageText(message, state);

      expect(adminText).toEqual('Courtney left the group');
    });
  });
});

describe(getMessagePreview, () => {
  it('adds the prefix for current user', function () {
    const state = new StoreBuilder().withCurrentUser({ id: 'current-user' }).build();

    const preview = getMessagePreview(
      { message: 'some message', sender: { userId: 'current-user' } } as Message,
      state
    );

    expect(preview).toEqual('You: some message');
  });

  it('adds the user firstName for non-current user', function () {
    const state = new StoreBuilder().withCurrentUser({ id: 'current-user' }).build();

    const preview = getMessagePreview(
      { message: 'some message', sender: { userId: 'another-user', firstName: 'Jack' } } as Message,
      state
    );

    expect(preview).toEqual('Jack: some message');
  });

  it('returns admin preview for admin messages', () => {
    const state = new StoreBuilder().withCurrentUser({ id: 'current-user' }).build();

    const preview = getMessagePreview(
      {
        message: 'some message',
        isAdmin: true,
        admin: { type: AdminMessageType.CONVERSATION_STARTED, userId: 'current-user' },
      } as Message,
      state
    );

    expect(preview).toEqual('You started the conversation');
  });

  it('describes an image message', function () {
    const state = new StoreBuilder().withCurrentUser({ id: 'current-user' }).build();

    const preview = getMessagePreview(
      {
        message: '',
        isAdmin: false,
        sender: { userId: 'current-user' },
        media: { type: MediaType.Image },
      } as Message,
      state
    );

    expect(preview).toEqual('You: sent an image');
  });

  it('returns failed to send message', function () {
    const state = new StoreBuilder().withCurrentUser({ id: 'current-user' }).build();

    const preview = getMessagePreview(
      { message: 'some message', isAdmin: false, sendStatus: MessageSendStatus.FAILED } as Message,
      state
    );

    expect(preview).toEqual('You: Failed to send');
  });
});

describe(previewDisplayDate, () => {
  it('displays the time of day for messages sent on the current day', () => {
    const now = moment();

    expect(previewDisplayDate(now.valueOf())).toEqual(now.format('h:mm A'));
  });

  it('displays the three-letter day abbreviation for messages sent within the preceding 7 days', () => {
    const sevenDaysAgo = moment().subtract(5, 'days');

    expect(previewDisplayDate(sevenDaysAgo.valueOf())).toEqual(sevenDaysAgo.format('ddd'));
  });

  it('displays the three-letter month abbreviation and day of the month for messages sent in the same calendar year prior to the last 7 days', () => {
    const withinCalendarYear = moment().subtract(10, 'days');

    expect(previewDisplayDate(withinCalendarYear.valueOf())).toEqual(withinCalendarYear.format('MMM D'));
  });

  it('displays the three-letter month abbreviation, day of the month, and the year for messages sent before the current calendar year', () => {
    const olderThanCalendarYear = moment().subtract(1, 'year').subtract(5, 'days');

    expect(previewDisplayDate(olderThanCalendarYear.valueOf())).toEqual(olderThanCalendarYear.format('MMM D, YYYY'));
  });
});
