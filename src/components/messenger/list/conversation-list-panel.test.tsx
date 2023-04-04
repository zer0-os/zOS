import React from 'react';
import { shallow } from 'enzyme';

import { ConversationListPanel, Properties } from './conversation-list-panel';
import { Channel } from '../../../store/channels';

describe('ConversationListPanel', () => {
  const subject = (props: Partial<Properties>) => {
    const allProps: Properties = {
      directMessages: [],
      handleMemberClick: () => null,
      toggleConversation: () => null,
      ...props,
    };

    return shallow(<ConversationListPanel {...allProps} />);
  };

  it('handle member click', function () {
    const handleMemberClick = jest.fn();
    const wrapper = subject({
      handleMemberClick: handleMemberClick,
      directMessages: [
        {
          id: 'test-conversation-id',
          otherMembers: [],
        } as any,
      ],
    });

    wrapper.find('ConversationItem').simulate('click', 'test-conversation-id');

    expect(handleMemberClick).toHaveBeenCalledWith('test-conversation-id');
  });

  it('renders filtered conversation list', function () {
    const conversations = [
      { id: 'convo-id-1', name: 'convo-1', otherMembers: [{ firstName: 'jack' }] },
      { id: 'convo-id-2', name: 'convo-2', otherMembers: [{ firstName: 'bob' }] },
      { id: 'convo-id-3', name: 'convo-3', otherMembers: [{ firstName: 'jacklyn' }] },
    ];

    const wrapper = subject({ directMessages: conversations as any });

    let displayChatNames = renderedConversations(wrapper).map((c) => c.name);
    expect(displayChatNames).toStrictEqual([
      'convo-1',
      'convo-2',
      'convo-3',
    ]);

    wrapper.find('SearchConversations').simulate('change', 'jac');

    displayChatNames = renderedConversations(wrapper).map((c) => c.name);
    expect(displayChatNames).toStrictEqual([
      'convo-1',
      'convo-3',
    ]);
  });
});

function renderedConversations(wrapper) {
  return wrapper.find('ConversationItem').map((node) => node.prop('conversation')) as Channel[];
}
