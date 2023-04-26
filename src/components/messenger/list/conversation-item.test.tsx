import React from 'react';
import { shallow } from 'enzyme';

import { ConversationItem, Properties } from './conversation-item';
import moment from 'moment';

describe('ConversationItem', () => {
  const subject = (props: Partial<Properties>) => {
    const allProps: Properties = {
      conversation: {} as any,
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
      } as any,
    });

    expect(wrapper.find('.conversation-item__unread-count').text()).toEqual('7');
  });

  it('renders last message timestamp', function () {
    const now = moment();
    const wrapper = subject({
      conversation: {
        lastMessage: {
          createdAt: now.valueOf(),
        },
        otherMembers: [],
      } as any,
    });

    expect(wrapper.find('.conversation-item__timestamp').text()).toEqual(now.format('MMM DD'));
  });

  it('renders last message summary', function () {
    const wrapper = subject({
      conversation: {
        lastMessage: {
          message: 'I said something here',
        },
        otherMembers: [],
      } as any,
    });

    expect(wrapper.find('.conversation-item__message').text()).toEqual('I said something here');
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
});

function title(wrapper) {
  return wrapper.find('.conversation-item__name').text();
}

function convoWith(...otherMembers): any {
  return {
    id: 'convo-id',
    otherMembers,
  };
}
