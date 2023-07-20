import React from 'react';
import { shallow } from 'enzyme';

import { ConversationItem, Properties } from './conversation-item';
import moment from 'moment';
import { ContentHighlighter } from '../../content-highlighter';
import { MediaType, MessageSendStatus } from '../../../store/messages';

describe('ConversationItem', () => {
  const subject = (props: Partial<Properties>) => {
    const allProps: Properties = {
      filter: '',
      conversation: {} as any,
      myUserId: '',
      activeConversationId: '',
      onClick: () => null,
      ...props,
    };

    return shallow(<ConversationItem {...allProps} />);
  };

  it('renders other members avatar for one on one', function () {
    const wrapper = subject({
      conversation: convoWith({ firstName: 'Johnny', profileImage: 'image-url' }),
    });

    expect(wrapper.find('Avatar').prop('imageURL')).toEqual('image-url');
  });

  it('renders group icon for group conversation with an image', function () {
    const wrapper = subject({
      conversation: {
        icon: 'custom-image-url',
        ...convoWith({ firstName: 'one' }, { firstName: 'two' }),
      },
    });

    expect(wrapper.find('Avatar').prop('imageURL')).toEqual('custom-image-url');
  });

  it('renders default group icon if group conversation has no image', function () {
    const wrapper = subject({
      conversation: {
        icon: 'https://static.sendbird.com/sample/cover/cover_11.jpg',
        ...convoWith({ firstName: 'one' }, { firstName: 'two' }),
      },
    });

    expect(wrapper).toHaveElement('.conversation-item__group-icon');
  });

  it('renders conversation title for one on one', function () {
    const wrapper = subject({
      conversation: convoWith({ firstName: 'Johnny', lastName: 'Cash' }),
    });

    const displayChatNames = wrapper.find('.conversation-item__name').map((node) => node.text());
    expect(displayChatNames).toStrictEqual(['Johnny Cash']);
  });

  it('renders conversation title for multi-members', function () {
    const wrapper = subject({
      conversation: convoWith({ firstName: 'Johnny', lastName: 'Cash' }, { firstName: 'Jackie', lastName: 'Chan' }),
    });

    expect(title(wrapper)).toStrictEqual('Johnny Cash, Jackie Chan');
  });

  it('renders conversation title for named conversation', function () {
    const wrapper = subject({
      conversation: {
        ...convoWith({ firstName: 'Johnny', lastName: 'Cash' }),
        name: 'My Named Conversation',
      },
    });

    expect(title(wrapper)).toStrictEqual('My Named Conversation');
  });

  it('publishes click event', function () {
    const handleMemberClick = jest.fn();
    const wrapper = subject({
      onClick: handleMemberClick,
      conversation: {
        ...convoWith(),
        id: 'test-conversation-id',
      },
    });

    wrapper.find('.conversation-item').first().simulate('click');

    expect(handleMemberClick).toHaveBeenCalledWith('test-conversation-id');
  });

  it('does not show unread count if there are no unread messages', function () {
    const wrapper = subject({
      conversation: {
        id: 'id',
        unreadCount: 0,
        otherMembers: [],
        lastMessage: { sender: { userId: 'id' } },
      } as any,
    });

    expect(wrapper).not.toHaveElement('.conversation-item__unread-count');
  });

  it('shows unread message count', function () {
    const wrapper = subject({
      conversation: {
        id: 'id',
        unreadCount: 7,
        otherMembers: [],
        lastMessage: { sender: { userId: 'id' } },
      } as any,
    });

    expect(wrapper.find('.conversation-item__unread-count').text()).toEqual('7');
  });

  it('renders the message preview', function () {
    const messagePreview = 'I said something here';

    const wrapper = subject({
      myUserId: 'id',
      conversation: {
        messagePreview,
        otherMembers: [],
        lastMessage: { sender: { userId: 'id', firstName: 'Johnny' } },
      } as any,
    });

    expect(wrapper.find(ContentHighlighter).prop('message')).toEqual(`You: ${messagePreview}`);
  });

  it('displays "You" when the last message sender is the user', function () {
    const conversation: any = {
      messagePreview: 'Hello there',
      lastMessage: { sender: { userId: 'my-user-id', firstName: 'John' } },
      otherMembers: [],
    };

    const wrapper = subject({
      conversation,
      myUserId: 'my-user-id',
    });

    expect(wrapper.find(ContentHighlighter).prop('message')).toEqual('You: Hello there');
  });

  it('displays the senders name when the last message sender is not the user', function () {
    const conversation: any = {
      messagePreview: 'Hello there',
      lastMessage: { sender: { userId: 'other-user-id', firstName: 'Steve' } },
      otherMembers: [],
    };

    const wrapper = subject({
      conversation,
      myUserId: 'my-user-id',
    });

    expect(wrapper.find(ContentHighlighter).prop('message')).toEqual('Steve: Hello there');
  });

  it('displays only messagePreview when lastMessage.admin has data', function () {
    const conversation: any = {
      messagePreview: 'Admin Message',
      lastMessage: {
        admin: {
          type: 'AdminMessageType',
          inviterId: 'some-id',
        },
        sender: { userId: 'other-user-id', firstName: 'Steve' },
      },
      otherMembers: [],
    };

    const wrapper = subject({
      conversation,
      myUserId: 'my-user-id',
    });

    expect(wrapper.find(ContentHighlighter).prop('message')).toEqual('Admin Message');
  });

  it('renders a text if i sent/received a media message', function () {
    const conversation: any = {
      messagePreview: '',
      otherMembers: [],
      lastMessage: { sender: { userId: 'my-user-id' }, media: { type: MediaType.Image } },
    };

    // sent
    let wrapper = subject({
      conversation,
      myUserId: 'my-user-id',
    });
    expect(wrapper.find(ContentHighlighter).prop('message')).toEqual('You: sent an image');

    // received
    conversation.lastMessage.sender.userId = 'other-user-id';
    wrapper = subject({
      conversation,
      myUserId: 'my-user-id',
    });
    expect(wrapper.find(ContentHighlighter).prop('message')).toEqual('You: received an image');
  });

  it('renders failed to send message if the last message failed', function () {
    const messagePreview = 'I said something here';

    const wrapper = subject({
      myUserId: 'id',
      conversation: {
        messagePreview,
        otherMembers: [],
        lastMessage: { sender: { userId: 'id', firstName: 'Johnny' }, sendStatus: MessageSendStatus.FAILED },
      } as any,
    });

    expect(wrapper.find(ContentHighlighter).prop('message')).toEqual('You: Failed to send');
  });

  describe('status', () => {
    it('renders inactive if no other members are online', function () {
      const wrapper = subject({
        conversation: {
          icon: 'icon-url',
          ...convoWith({ isOnline: false }, { isOnline: false }),
        },
      });

      expect(wrapper.find('Avatar').prop('statusType')).toEqual('offline');
    });

    it('renders active if any other members are online', function () {
      const wrapper = subject({
        conversation: {
          icon: 'icon-url',
          ...convoWith({ isOnline: false }, { isOnline: true }),
        },
      });

      expect(wrapper.find('Avatar').prop('statusType')).toEqual('active');
    });
  });

  describe('tooltip', () => {
    it('renders Online if single member is currently online', function () {
      const wrapper = subject({
        conversation: convoWith({ isOnline: true }),
      });

      expect(wrapper.find('Tooltip').prop('overlay')).toEqual('Online');
    });

    it('renders last seen time if single member has previously been online', function () {
      const wrapper = subject({
        conversation: convoWith({ lastSeenAt: moment().subtract(2, 'days').toISOString() }),
      });

      expect(wrapper.find('Tooltip').prop('overlay')).toEqual('Last Seen: 2 days ago');
    });

    it('renders member names when multiple other members', function () {
      const wrapper = subject({
        conversation: convoWith({ firstName: 'Johnny', lastName: 'Cash' }, { firstName: 'Jackie', lastName: 'Chan' }),
      });

      expect(wrapper.find('Tooltip').prop('overlay')).toEqual('Johnny Cash, Jackie Chan');
    });
  });

  describe('displayDate', () => {
    const createWrapper = (createdAt: moment.Moment) => {
      return subject({
        conversation: {
          lastMessage: {
            createdAt: createdAt.valueOf(),
            sender: { userId: 'id' },
          },
          otherMembers: [],
        } as any,
      });
    };

    it('displays the time of day for messages sent on the current day', () => {
      const now = moment();
      const wrapper = createWrapper(now);

      expect(wrapper.find('.conversation-item__timestamp').text()).toEqual(now.format('h:mm A'));
    });

    it('displays the three-letter day abbreviation for messages sent within the preceding 7 days', () => {
      const sevenDaysAgo = moment().subtract(5, 'days');
      const wrapper = createWrapper(sevenDaysAgo);

      expect(wrapper.find('.conversation-item__timestamp').text()).toEqual(sevenDaysAgo.format('ddd'));
    });

    it('displays the three-letter month abbreviation and day of the month for messages sent in the same calendar year prior to the last 7 days', () => {
      const messageDate = moment().subtract(10, 'days');
      const wrapper = createWrapper(messageDate);

      expect(wrapper.find('.conversation-item__timestamp').text()).toEqual(messageDate.format('MMM D'));
    });

    it('displays the three-letter month abbreviation, day of the month, and the year for messages sent before the current calendar year', () => {
      const messageDate = moment().subtract(1, 'year').subtract(5, 'days');
      const wrapper = createWrapper(messageDate);

      expect(wrapper.find('.conversation-item__timestamp').text()).toEqual(messageDate.format('MMM D, YYYY'));
    });
  });
});

function title(wrapper) {
  return wrapper.find('.conversation-item__name').text();
}

function convoWith(...otherMembers): any {
  return {
    id: 'convo-id',
    otherMembers,
    lastMessage: { sender: { ...otherMembers[0], userId: 'id' } },
  };
}
