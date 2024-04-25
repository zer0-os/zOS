import React from 'react';
import { shallow } from 'enzyme';

import { ConversationItem, Properties } from '.';
import { ContentHighlighter } from '../../../content-highlighter';
import { Avatar } from '@zero-tech/zui/components';
import { bem } from '../../../../lib/bem';

const c = bem('.conversation-item');

describe(ConversationItem, () => {
  const subject = (props: Partial<Properties>) => {
    const allProps: Properties = {
      filter: '',
      conversation: {} as any,
      myUserId: '',
      activeConversationId: '',
      onClick: () => null,
      onFavoriteRoom: () => null,
      onUnfavoriteRoom: () => null,
      ...props,
    };

    return shallow(<ConversationItem {...allProps} />);
  };

  it('renders other members avatar for one on one', function () {
    const wrapper = subject({
      conversation: { isOneOnOne: true, ...convoWith({ profileImage: 'image-url' }) },
    });

    expect(wrapper.find(Avatar)).toHaveProp('imageURL', 'image-url');
  });

  it('renders group icon for group conversation with an image', function () {
    const wrapper = subject({
      conversation: { icon: 'custom-image-url', ...convoWith({ firstName: 'one' }, { firstName: 'two' }) },
    });

    expect(wrapper.find(Avatar)).toHaveProp('imageURL', 'custom-image-url');
  });

  it('renders conversation title for one on one', function () {
    const wrapper = subject({ conversation: convoWith({ firstName: 'Johnny', lastName: 'Cash' }) });

    expect(title(wrapper)).toStrictEqual('Johnny Cash');
  });

  it('renders conversation title for multi-members', function () {
    const wrapper = subject({
      conversation: convoWith({ firstName: 'Johnny', lastName: 'Cash' }, { firstName: 'Jackie', lastName: 'Chan' }),
    });

    expect(title(wrapper)).toStrictEqual('Johnny Cash, Jackie Chan');
  });

  it('renders conversation title for named conversation', function () {
    const wrapper = subject({
      conversation: { ...convoWith({ firstName: 'Johnny', lastName: 'Cash' }), name: 'My Named Conversation' },
    });

    expect(title(wrapper)).toStrictEqual('My Named Conversation');
  });

  it('publishes click event', function () {
    const onClick = jest.fn();
    const wrapper = subject({ onClick, conversation: { ...convoWith(), id: 'test-conversation-id' } });

    wrapper.find(c('')).first().simulate('click');

    expect(onClick).toHaveBeenCalledWith('test-conversation-id');
  });

  it('does not show unread count if there are no unread messages', function () {
    const wrapper = subject({
      conversation: { id: 'id', unreadCount: 0, otherMembers: [] } as any,
    });

    expect(wrapper).not.toHaveElement(c('unread-count'));
  });

  it('shows unread message count', function () {
    const wrapper = subject({ conversation: { id: 'id', unreadCount: 7, otherMembers: [] } as any });

    expect(wrapper.find(c('unread-count'))).toHaveText('7');
  });

  it('renders the message preview', function () {
    const wrapper = subject({ conversation: { messagePreview: 'I said something here', otherMembers: [] } as any });

    expect(wrapper.find(ContentHighlighter)).toHaveProp('message', 'I said something here');
  });

  it('renders the previewDisplayDate', function () {
    const wrapper = subject({ conversation: { previewDisplayDate: 'Aug 1, 2021', otherMembers: [] } as any });

    expect(wrapper.find(c('timestamp'))).toHaveText('Aug 1, 2021');
  });

  describe('status', () => {
    it('renders inactive if no other members are online', function () {
      const wrapper = subject({
        conversation: { icon: 'icon-url', ...convoWith({ isOnline: false }, { isOnline: false }) },
      });

      expect(wrapper.find(Avatar)).toHaveProp('statusType', 'offline');
    });

    it('renders active if any other members are online', function () {
      const wrapper = subject({
        conversation: { icon: 'icon-url', ...convoWith({ isOnline: false }, { isOnline: true }) },
      });

      expect(wrapper.find(Avatar)).toHaveProp('statusType', 'active');
    });
  });
});

function title(wrapper) {
  return wrapper.find(c('name')).text();
}

function convoWith(...otherMembers): any {
  return {
    id: 'convo-id',
    otherMembers,
  };
}
