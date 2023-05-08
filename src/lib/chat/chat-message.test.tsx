import { map as mapMessage } from './chat-message';

describe('sendbird events', () => {
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

    expect(mappedMessage).toStrictEqual({
      id: 8728123760,
      message: 'test mention @[0xE883...5870 ](user:9bf99cf6-559e-46e8-ba73-07faed8747ac) with image',
      parentMessageText: 'hi @[0xE883...5870 ](user:9bf99cf6-559e-46e8-ba73-07faed8747ac) ',
      createdAt: 1680691559605,
      updatedAt: 0,
      sender: {
        userId: '1bc08a9b-6f5b-497f-9d0b-3cf47abe426a',
        firstName: '0x03D3...d161',
        lastName: '',
        profileImage: 'https://res.cloudinary.com/fact0ry-dev/image/upload/v1623021589/zero-assets/avatars/pfp-16.jpg',
        profileId: 'b52d1815-97db-45a7-8477-5b976e9eedde',
      },
      mentionedUsers: [],
      hidePreview: false,
      image: undefined,
      media: undefined,
      isAdmin: false,
      admin: {},
    });
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
