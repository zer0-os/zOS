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

  it('renders conversation title for one on one', function () {
    const wrapper = subject({
      conversation: convoWith({ firstName: 'Johnny', lastName: 'Cash' }),
    });

    const displayChatNames = wrapper.find('.direct-message-members__user-name').map((node) => node.text());
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

    wrapper.find('.direct-message-members__user').first().simulate('click');

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

    expect(wrapper).not.toHaveElement('.direct-message-members__user-unread-count');
  });

  it('shows unread message count', function () {
    const wrapper = subject({
      conversation: {
        id: 'id',
        unreadCount: 7,
        otherMembers: [],
      } as any,
    });

    expect(wrapper.find('.direct-message-members__user-unread-count').text()).toEqual('7');
  });

  describe('status', () => {
    it('renders inactive if no other members are online', function () {
      const wrapper = subject({
        conversation: convoWith({ isOnline: false }, { isOnline: false }),
      });

      expect(wrapper).not.toHaveElement('.direct-message-members__user-status--active');
    });

    it('renders active if any other members are online', function () {
      const wrapper = subject({
        conversation: convoWith({ isOnline: false }, { isOnline: true }),
      });

      expect(wrapper).toHaveElement('.direct-message-members__user-status--active');
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
  return wrapper.find('.direct-message-members__user-name').text();
}

function convoWith(...otherMembers): any {
  return {
    id: 'convo-id',
    otherMembers,
  };
}
