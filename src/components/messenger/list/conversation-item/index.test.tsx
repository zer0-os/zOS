import React from 'react';
import { shallow } from 'enzyme';

import { ConversationItem, Properties } from '.';
import { ContentHighlighter } from '../../../content-highlighter';
import { Avatar } from '@zero-tech/zui/components';
import { bem } from '../../../../lib/bem';
import { IconBellOff1 } from '@zero-tech/zui/icons';
import { DefaultRoomLabels } from '../../../../store/channels';

const c = bem('.conversation-item');

describe(ConversationItem, () => {
  const subject = (props: Partial<Properties>) => {
    const allProps: Properties = {
      filter: '',
      conversation: {} as any,
      myUserId: '',
      activeConversationId: '',
      onClick: () => null,
      onAddLabel: () => null,
      onRemoveLabel: () => null,
      isCollapsed: false,
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

  it('renders muted icon if conversation is muted', function () {
    const wrapper = subject({
      conversation: { ...convoWith(), id: 'test-conversation-id', labels: [DefaultRoomLabels.MUTE] },
    });

    expect(wrapper).toHaveElement(IconBellOff1);
  });

  it('does not render muted icon if conversation is not muted', function () {
    const wrapper = subject({
      conversation: { ...convoWith(), id: 'test-conversation-id', labels: [] },
    });

    expect(wrapper).not.toHaveElement(IconBellOff1);
  });

  it('publishes click event', function () {
    const onClick = jest.fn();
    const wrapper = subject({ onClick, conversation: { ...convoWith(), id: 'test-conversation-id' } });

    wrapper.find(c('')).first().simulate('click');

    expect(onClick).toHaveBeenCalledWith('test-conversation-id');
  });

  it('does not show unread count if there are no unread messages', function () {
    const wrapper = subject({
      conversation: { id: 'id', unreadCount: { total: 0, highlight: 0 }, otherMembers: [] } as any,
    });

    expect(wrapper).not.toHaveElement(c('unread-count'));
  });

  it('shows unread message count', function () {
    const wrapper = subject({
      conversation: { id: 'id', unreadCount: { total: 7, highlight: 0 }, otherMembers: [] } as any,
    });

    expect(wrapper.find(c('unread-count'))).toHaveText('7');
  });

  it('renders the message preview', function () {
    const wrapper = subject({
      conversation: {
        messagePreview: 'I said something here',
        otherMembers: [],
        unreadCount: { total: 0, highlight: 0 },
      } as any,
    });

    expect(wrapper.find(ContentHighlighter)).toHaveProp('message', 'I said something here');
  });

  it('renders the otherMembersTyping', function () {
    const wrapper = subject({
      conversation: {
        otherMembersTyping: ['Johnny'],
        otherMembers: [],
        unreadCount: { total: 0, highlight: 0 },
      } as any,
    });

    expect(wrapper.find(ContentHighlighter)).toHaveProp('message', 'Johnny is typing...');
  });

  it('renders the otherMembersTyping instead of message preview if users are typing', function () {
    const wrapper = subject({
      conversation: {
        messagePreview: 'I said something here',
        otherMembersTyping: ['Dale', 'Dom'],
        otherMembers: [],
        unreadCount: { total: 0, highlight: 0 },
      } as any,
    });

    expect(wrapper.find(ContentHighlighter)).toHaveProp('message', 'Dale and Dom are typing...');
  });

  it('renders the previewDisplayDate', function () {
    const wrapper = subject({
      conversation: {
        previewDisplayDate: 'Aug 1, 2021',
        otherMembers: [],
        unreadCount: { total: 0, highlight: 0 },
      } as any,
    });

    expect(wrapper.find(c('timestamp'))).toHaveText('Aug 1, 2021');
  });
});

function title(wrapper) {
  return wrapper.find(c('name')).text();
}

function convoWith(...otherMembers): any {
  return {
    id: 'convo-id',
    otherMembers,
    unreadCount: { total: 0, highlight: 0 },
  };
}
