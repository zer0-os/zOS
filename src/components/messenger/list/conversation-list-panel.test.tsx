import React from 'react';
import { shallow } from 'enzyme';

import { ConversationListPanel, Properties } from './conversation-list-panel';
import { Channel } from '../../../store/channels';

describe('ConversationListPanel', () => {
  const subject = (props: Partial<Properties>) => {
    const allProps: Properties = {
      conversations: [],
      search: () => undefined,
      onConversationClick: () => null,
      startConversation: () => null,
      onCreateConversation: () => null,
      ...props,
    };

    return shallow(<ConversationListPanel {...allProps} />);
  };

  it('handle member click', function () {
    const handleMemberClick = jest.fn();
    const wrapper = subject({
      onConversationClick: handleMemberClick,
      conversations: [
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

    const wrapper = subject({ conversations: conversations as any });

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

  it('renders user search results', async function () {
    const search = jest.fn();
    search.mockResolvedValue([
      { name: 'jack', id: 'user-1', image: 'image-1' },
      { name: 'jacklyn', id: 'user-3', image: 'image-3' },
    ]);

    const wrapper = subject({ search });

    await searchFor(wrapper, 'ja');

    let userSearchResults = renderedUserSearchResults(wrapper);

    expect(userSearchResults).toStrictEqual([
      { value: 'user-1', label: 'jack', image: 'image-1' },
      { value: 'user-3', label: 'jacklyn', image: 'image-3' },
    ]);
  });
});

function renderedUserSearchResults(wrapper) {
  return wrapper.find('UserSearchResults').prop('results');
}

function searchFor(wrapper, searchString) {
  const searchInput = wrapper.find('SearchConversations');
  const onChange = searchInput.prop('onChange');
  onChange({ target: { value: searchString } });

  return new Promise((resolve) => setTimeout(resolve, 0));
}

function renderedConversations(wrapper) {
  return wrapper.find('ConversationItem').map((node) => node.prop('conversation')) as Channel[];
}
