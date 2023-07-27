import React from 'react';
import { shallow } from 'enzyme';

import { ConversationListPanel, Properties } from './conversation-list-panel';
import { Channel } from '../../../store/channels';

describe('ConversationListPanel', () => {
  const subject = (props: Partial<Properties>) => {
    const allProps: Properties = {
      conversations: [],
      myUserId: '',
      activeConversationId: '',
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

    wrapper.find('Input').simulate('change', 'jac');

    displayChatNames = renderedConversations(wrapper).map((c) => c.name);
    expect(displayChatNames).toStrictEqual([
      'convo-1',
      'convo-3',
    ]);
  });

  it('renders conversation group names as well in the filtered conversation list', function () {
    const conversations = [
      { id: 'convo-id-1', name: '', otherMembers: [{ firstName: 'test' }] },
      { id: 'convo-id-2', name: '', otherMembers: [{ firstName: 'bob' }] },
      {
        id: 'convo-id-3',
        name: 'Test Group',
        otherMembers: [
          { firstName: 'name-1' },
          { firstName: 'name-2' },
        ],
      },
      {
        id: 'convo-id-4',
        name: 'My Awesome group',
        otherMembers: [
          { firstName: 'name-1' },
          { firstName: 'name-2' },
        ],
      },
    ];

    const wrapper = subject({ conversations: conversations as any });

    let displayChatNames = renderedConversations(wrapper).map((c) => c.id);
    expect(displayChatNames).toStrictEqual([
      'convo-id-1',
      'convo-id-2',
      'convo-id-3',
      'convo-id-4',
    ]);

    // change to -> 'test'
    wrapper.find('Input').simulate('change', 'test');
    displayChatNames = renderedConversations(wrapper).map((c) => c.name);
    expect(displayChatNames).toStrictEqual([
      '', // convo-id-1 chat (one-2-one)
      'Test Group',
    ]);

    // change to -> 'Group'
    wrapper.find('Input').simulate('change', 'Group');
    displayChatNames = renderedConversations(wrapper).map((c) => c.name);
    expect(displayChatNames).toStrictEqual([
      'Test Group',
      'My Awesome group',
    ]);
  });

  it('selecting an existing conversation announces click event', async function () {
    const onConversationClick = jest.fn();
    const conversations = [
      { id: 'convo-id-2', name: '', otherMembers: [{ firstName: 'bob' }] },
    ] as any;
    const wrapper = subject({ conversations, onConversationClick });

    await searchFor(wrapper, 'bob');
    const filteredConversations = wrapper.find('ConversationItem');
    filteredConversations.at(0).simulate('click', 'convo-id-2');

    expect(onConversationClick).toHaveBeenCalledWith('convo-id-2');
  });

  it('selecting an existing conversation clears the filtered state', async function () {
    const onConversationClick = jest.fn();
    const conversations = [
      { id: 'convo-id-2', name: '', otherMembers: [{ firstName: 'bob' }] },
      { id: 'convo-id-2', name: '', otherMembers: [{ firstName: 'jack' }] },
    ] as any;
    const wrapper = subject({ conversations, onConversationClick });

    await searchFor(wrapper, 'bob');
    const filteredConversations = wrapper.find('ConversationItem');
    filteredConversations.at(0).simulate('click', 'convo-id-2');

    const resultingConversatons = wrapper.find('ConversationItem');
    expect(resultingConversatons.length).toEqual(2);
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

  it('selecting a new user announces create conversation event', async function () {
    const onCreateConversation = jest.fn();
    const search = jest.fn();
    search.mockResolvedValue([
      { name: 'jack', id: 'user-1', image: 'image-1' },
      { name: 'jacklyn', id: 'user-3', image: 'image-3' },
    ]);
    const wrapper = subject({ onCreateConversation, search });

    await searchFor(wrapper, 'ja');
    wrapper.find('UserSearchResults').simulate('create', 'user-1');

    expect(onCreateConversation).toHaveBeenCalledWith('user-1');
  });

  it('selecting a new user clears the filtered state', async function () {
    const onCreateConversation = jest.fn();
    const search = jest.fn();
    search.mockResolvedValue([
      { name: 'jack', id: 'user-1', image: 'image-1' },
      { name: 'jacklyn', id: 'user-3', image: 'image-3' },
    ]);
    const wrapper = subject({ onCreateConversation, search });

    await searchFor(wrapper, 'ja');
    wrapper.find('UserSearchResults').simulate('create', 'user-1');

    expect(wrapper).not.toHaveElement('UserSearchResults');
  });
});

function renderedUserSearchResults(wrapper) {
  return wrapper.find('UserSearchResults').prop('results');
}

async function searchFor(wrapper, searchString) {
  const searchInput = wrapper.find('Input');
  const onChange = searchInput.prop('onChange');
  await onChange(searchString);
}

function renderedConversations(wrapper) {
  return wrapper.find('ConversationItem').map((node) => node.prop('conversation')) as Channel[];
}
