import moment from 'moment';
import { AdminMessageType, MediaType, Message, MessageSendStatus } from '../../store/messages';
import { RootState } from '../../store/reducer';
import { StoreBuilder } from '../../store/test/store';
import { adminMessageText, getMessagePreview, previewDisplayDate } from './chat-message';

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

      expect(adminText).toEqual('You joined Courtney on ZERO');
    });

    it('translates message if current user was inviter', () => {
      const state = getState('current-user', { 'invitee-id': { id: 'invitee-id', firstName: 'Julie' } });
      const message = {
        message: 'some message',
        isAdmin: true,
        admin: { type: AdminMessageType.JOINED_ZERO, inviteeId: 'invitee-id', inviterId: 'current-user' },
      } as Message;

      const adminText = adminMessageText(message, state);

      expect(adminText).toEqual('Julie joined you on ZERO');
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

      expect(adminText).toEqual('Courtney left the conversation');
    });
  });

  describe(AdminMessageType.MEMBER_ADDED_TO_CONVERSATION, () => {
    it('returns default message if admin user id not found', () => {
      const state = getState('current-user', {});
      const adminText = adminMessageText(
        {
          message: 'some message',
          isAdmin: true,
          admin: { type: AdminMessageType.MEMBER_ADDED_TO_CONVERSATION, userId: 'unknown-user-id' },
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
        admin: { type: AdminMessageType.MEMBER_ADDED_TO_CONVERSATION, userId: 'admin-user-id' },
      } as Message;

      const adminText = adminMessageText(message, state);

      expect(adminText).toEqual('Courtney was added to the conversation');
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
    const currentDate = moment('2024-01-20');
    const withinCalendarYear = moment(currentDate).subtract(10, 'days');

    expect(previewDisplayDate(withinCalendarYear.valueOf(), currentDate)).toEqual(withinCalendarYear.format('MMM D'));
  });

  it('displays the three-letter month abbreviation, day of the month, and the year for messages sent before the current calendar year', () => {
    const olderThanCalendarYear = moment().subtract(1, 'year').subtract(5, 'days');

    expect(previewDisplayDate(olderThanCalendarYear.valueOf())).toEqual(olderThanCalendarYear.format('MMM D, YYYY'));
  });
});
