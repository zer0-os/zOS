import React from 'react';
import { shallow } from 'enzyme';

import { ConversationListPanel, Properties } from '.';
import { Channel, DefaultRoomLabels } from '../../../../store/channels';
import { stubConversation } from '../../../../store/test/store';
import { IconStar1 } from '@zero-tech/zui/icons';

describe('ConversationListPanel', () => {
  const subject = (props: Partial<Properties>) => {
    const allProps: Properties = {
      conversations: [],
      myUserId: '',
      activeConversationId: '',
      isLabelDataLoaded: true,
      search: () => undefined,
      onConversationClick: () => null,
      onCreateConversation: () => null,
      onAddLabel: () => null,
      onRemoveLabel: () => null,
      isCollapsed: false,
      ...props,
    };

    return shallow(<ConversationListPanel {...allProps} />);
  };

  it('handle member click', function () {
    const onConversationClick = jest.fn();
    const wrapper = subject({
      onConversationClick,
      conversations: [
        {
          id: 'test-conversation-id',
          otherMembers: [],
          unreadCount: { total: 0, highlight: 0 },
        } as any,
      ],
    });

    wrapper.find('ConversationItem').simulate('click', 'test-conversation-id');

    expect(onConversationClick).toHaveBeenCalledWith({ conversationId: 'test-conversation-id' });
  });

  it('renders filtered conversation list', function () {
    const conversations = [
      {
        id: 'convo-id-1',
        name: 'convo-1',
        otherMembers: [{ firstName: 'jack', primaryZID: '0://world.jack' }],
        unreadCount: { total: 0, highlight: 0 },
      },
      {
        id: 'convo-id-2',
        name: 'convo-2',
        otherMembers: [{ firstName: 'bob', primaryZID: 'world.bob' }],
        unreadCount: { total: 0, highlight: 0 },
      },
      {
        id: 'convo-id-3',
        name: 'convo-3',
        otherMembers: [{ firstName: 'jacklyn' }],
        unreadCount: { total: 0, highlight: 0 },
      },
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

  it('renders conversations based on selected tab', function () {
    const conversations = [
      stubConversation({ name: 'convo-1', unreadCount: { total: 0, highlight: 0 } }),
      stubConversation({ name: 'convo-2', labels: [DefaultRoomLabels.WORK], unreadCount: { total: 0, highlight: 0 } }),
      stubConversation({ name: 'convo-3', labels: [DefaultRoomLabels.WORK], unreadCount: { total: 0, highlight: 0 } }),
      stubConversation({
        name: 'convo-4',
        labels: [DefaultRoomLabels.FAMILY],
        unreadCount: { total: 0, highlight: 0 },
      }),
    ];
    const wrapper = subject({ conversations: conversations as any });

    selectTab(wrapper, 'Work');
    expect(renderedConversationNames(wrapper)).toStrictEqual(['convo-2', 'convo-3']);

    selectTab(wrapper, 'All');
    expect(renderedConversationNames(wrapper)).toStrictEqual([
      'convo-1',
      'convo-2',
      'convo-3',
      'convo-4',
    ]);

    selectTab(wrapper, 'Family');
    expect(renderedConversationNames(wrapper)).toStrictEqual(['convo-4']);
  });

  it('renders Favorites tab first', function () {
    const conversations = [
      stubConversation({
        name: 'convo-1',
        labels: [DefaultRoomLabels.FAVORITE],
        unreadCount: { total: 0, highlight: 0 },
      }),
      stubConversation({ name: 'convo-2', unreadCount: { total: 0, highlight: 0 } }),
    ];
    const wrapper = subject({ conversations: conversations as any });

    const tabs = wrapper.find('.messages-list__tab');
    expect(tabs.at(0)).toHaveElement(IconStar1);
    expect(tabs.at(1)).toHaveText('All');
  });

  it('sets selectedTab to Favorites if there are favorite and non-archived conversations', function () {
    const conversations = [
      stubConversation({
        name: 'convo-1',
        labels: [DefaultRoomLabels.FAVORITE],
        unreadCount: { total: 0, highlight: 0 },
      }),
      stubConversation({
        name: 'convo-2',
        labels: [DefaultRoomLabels.FAVORITE, DefaultRoomLabels.ARCHIVED],
        unreadCount: { total: 0, highlight: 0 },
      }),
    ];
    const wrapper = subject({ conversations: conversations as any });

    expect(wrapper.state('selectedTab')).toEqual('favorites');
  });

  it('sets selectedTab to All if there are no favorite and non-archived conversations', function () {
    const conversations = [
      stubConversation({ name: 'convo-1', unreadCount: { total: 0, highlight: 0 } }),
      stubConversation({
        name: 'convo-2',
        labels: [DefaultRoomLabels.ARCHIVED],
        unreadCount: { total: 0, highlight: 0 },
      }),
    ];
    const wrapper = subject({ conversations: conversations as any });

    expect(wrapper.state('selectedTab')).toEqual('all');
  });

  it('renders default state when label list is empty', function () {
    const conversations = [stubConversation({ name: 'convo-1', unreadCount: { total: 0, highlight: 0 } })];
    const wrapper = subject({ conversations: conversations as any });

    selectTab(wrapper, 'Work');

    expect(wrapper).toHaveElement('.messages-list__label-preview');
  });

  it('does not render default state when label list is empty', function () {
    const conversations = [
      stubConversation({
        name: 'convo-1',
        labels: [DefaultRoomLabels.FAVORITE],
        unreadCount: { total: 0, highlight: 0 },
      }),
    ];
    const wrapper = subject({ conversations: conversations as any });

    selectTab(wrapper, 'All');

    expect(wrapper).not.toHaveElement('.messages-list__label-preview');
  });

  it('renders tab unread counts', function () {
    const conversations = [
      stubConversation({ name: 'convo-1', unreadCount: { total: 3, highlight: 0 } }),
      stubConversation({
        name: 'convo-2',
        unreadCount: { total: 11, highlight: 0 },
        labels: [DefaultRoomLabels.FAMILY],
      }),
      stubConversation({
        name: 'convo-3',
        unreadCount: { total: 17, highlight: 0 },
        labels: [DefaultRoomLabels.FAMILY],
      }),
      stubConversation({ name: 'convo-4', unreadCount: { total: 7, highlight: 0 } }),
      stubConversation({ name: 'convo-5', unreadCount: { total: 13, highlight: 0 }, labels: [DefaultRoomLabels.WORK] }),
    ];
    const wrapper = subject({ conversations: conversations as any });

    const allTab = tabNamed(wrapper, 'All');
    expect(allTab.find('.messages-list__tab-badge')).toHaveText('51');

    const favoritesTab = tabNamed(wrapper, 'Family');
    expect(favoritesTab.find('.messages-list__tab-badge')).toHaveText('28');

    const workTab = tabNamed(wrapper, 'Work');
    expect(workTab.find('.messages-list__tab-badge')).toHaveText('13');
  });

  it('does not render unread count if count is zero', function () {
    const conversations = [
      stubConversation({ name: 'convo-1', unreadCount: { total: 0, highlight: 0 } }),
      stubConversation({ name: 'convo-2', unreadCount: { total: 0, highlight: 0 }, labels: [DefaultRoomLabels.WORK] }),
    ];
    const wrapper = subject({ conversations: conversations as any });

    expect(tabNamed(wrapper, 'All')).not.toHaveElement('.messages-list__tab-badge');
    expect(tabNamed(wrapper, 'Work')).not.toHaveElement('.messages-list__tab-badge');
  });

  it('does not render unread count if count if conversation is archived', function () {
    const conversations = [
      stubConversation({ name: 'convo-1', unreadCount: { total: 3, highlight: 0 } }),
      stubConversation({
        name: 'convo-2',
        unreadCount: { total: 5, highlight: 0 },
        labels: [DefaultRoomLabels.ARCHIVED, DefaultRoomLabels.WORK],
      }),
    ];
    const wrapper = subject({ conversations: conversations as any });

    const workTab = tabNamed(wrapper, 'Work');
    expect(workTab).not.toHaveElement('.messages-list__tab-badge');

    const allTab = tabNamed(wrapper, 'All');
    expect(allTab.find('.messages-list__tab-badge')).toHaveText('3');
  });

  it('does not render unread count for archived label', function () {
    const conversations = [
      stubConversation({
        name: 'convo-2',
        unreadCount: { total: 5, highlight: 0 },
        labels: [DefaultRoomLabels.ARCHIVED],
      }),
    ];
    const wrapper = subject({ conversations: conversations as any });

    const archivedTab = tabNamed(wrapper, 'Archived');
    expect(archivedTab).not.toHaveElement('.messages-list__tab-badge');
  });

  it('does not include archived conversations in All unread count total', function () {
    const conversations = [
      stubConversation({ name: 'convo-1', unreadCount: { total: 3, highlight: 0 } }),
      stubConversation({
        name: 'convo-2',
        unreadCount: { total: 5, highlight: 0 },
        labels: [DefaultRoomLabels.ARCHIVED],
      }),
      stubConversation({ name: 'convo-3', unreadCount: { total: 2, highlight: 0 }, labels: [DefaultRoomLabels.WORK] }),
    ];
    const wrapper = subject({ conversations: conversations as any });

    const allTab = tabNamed(wrapper, 'All');
    expect(allTab.find('.messages-list__tab-badge')).toHaveText('5');

    const workTab = tabNamed(wrapper, 'Work');
    expect(workTab.find('.messages-list__tab-badge')).toHaveText('2');
  });

  it('renders conversations in the archived tab', function () {
    const conversations = [
      stubConversation({
        name: 'convo-1',
        labels: [DefaultRoomLabels.ARCHIVED],
        unreadCount: { total: 0, highlight: 0 },
      }),
      stubConversation({ name: 'convo-2', unreadCount: { total: 0, highlight: 0 } }),
    ];
    const wrapper = subject({ conversations: conversations as any });

    selectTab(wrapper, 'Archived');
    expect(renderedConversationNames(wrapper)).toStrictEqual(['convo-1']);
  });

  it('does not render archived conversations in other tabs', function () {
    const conversations = [
      stubConversation({
        name: 'convo-1',
        labels: [DefaultRoomLabels.ARCHIVED, DefaultRoomLabels.WORK],
        unreadCount: { total: 0, highlight: 0 },
      }),
      stubConversation({ name: 'convo-2', labels: [DefaultRoomLabels.WORK], unreadCount: { total: 0, highlight: 0 } }),
    ];
    const wrapper = subject({ conversations: conversations as any });

    selectTab(wrapper, 'All');
    expect(renderedConversationNames(wrapper)).toStrictEqual(['convo-2']);

    selectTab(wrapper, 'Work');
    expect(renderedConversationNames(wrapper)).toStrictEqual(['convo-2']);
  });

  it('renders conversation group names as well in the filtered conversation list', function () {
    const conversations = [
      { id: 'convo-id-1', name: '', otherMembers: [{ firstName: 'test' }], unreadCount: { total: 0, highlight: 0 } },
      { id: 'convo-id-2', name: '', otherMembers: [{ firstName: 'bob' }], unreadCount: { total: 0, highlight: 0 } },
      {
        id: 'convo-id-3',
        name: 'Test Group',
        otherMembers: [
          { firstName: 'name-1' },
          { firstName: 'name-2' },
        ],
        unreadCount: { total: 0, highlight: 0 },
      },
      {
        id: 'convo-id-4',
        name: 'My Awesome group',
        otherMembers: [
          { firstName: 'name-1' },
          { firstName: 'name-2' },
        ],
        unreadCount: { total: 0, highlight: 0 },
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

  describe('filtered conversations', () => {
    const conversations = [
      {
        id: 'convo-id-1',
        name: 'convo-1',
        otherMembers: [{ firstName: 'jack', primaryZID: '0://world.iamjack' }],
        unreadCount: { total: 0, highlight: 0 },
      },
      {
        id: 'convo-id-2',
        name: 'convo-2',
        otherMembers: [{ firstName: 'bob', primaryZID: '0://world.bob' }],
        unreadCount: { total: 0, highlight: 0 },
      },
      {
        id: 'convo-id-3',
        name: 'convo-3',
        otherMembers: [{ firstName: 'jacklyn', primaryZID: '0://world.jacklyn' }],
        unreadCount: { total: 0, highlight: 0 },
      },
      {
        id: 'convo-id-4',
        name: 'convo-4',
        otherMembers: [
          { firstName: 'user1', primaryZID: '0://world.user1' },
          { firstName: 'user2' },
        ],
        unreadCount: { total: 0, highlight: 0 },
      },
      {
        id: 'convo-id-5',
        name: 'user1 and user2',
        otherMembers: [
          { firstName: 'user1', primaryZID: '0://world.user1' },
          { firstName: 'user2', primaryZID: '0://world.user2' },
        ],
        unreadCount: { total: 0, highlight: 0 },
      },
    ];

    it('filters conversations based on name (direct match)', () => {
      const wrapper = subject({ conversations: conversations as any });

      wrapper.find('Input').simulate('change', 'convo-1');
      let displayChatNames = renderedConversations(wrapper).map((c) => c.name);
      expect(displayChatNames).toStrictEqual(['convo-1']);
    });

    it('filters conversations based on other members name (direct match)', () => {
      const wrapper = subject({ conversations: conversations as any });

      wrapper.find('Input').simulate('change', 'bob');
      const displayChatNames = renderedConversations(wrapper).map((c) => c.name);
      expect(displayChatNames).toStrictEqual(['convo-2']);
    });

    it('filters conversations based on other members name (indirect match)', () => {
      const wrapper = subject({ conversations: conversations as any });

      wrapper.find('Input').simulate('change', 'jacklyn');
      const displayChatNames = renderedConversations(wrapper).map((c) => c.name);
      expect(displayChatNames).toStrictEqual(['convo-3']);
    });

    it('filters conversations based on primaryZID (direct match)', () => {
      const wrapper = subject({ conversations: conversations as any });

      wrapper.find('Input').simulate('change', 'world.iamjack');
      const displayChatNames = renderedConversations(wrapper).map((c) => c.name);
      expect(displayChatNames).toStrictEqual(['convo-1']);
    });

    it('filters conversations based on primaryZID (indirect match)', () => {
      const wrapper = subject({ conversations: conversations as any });

      wrapper.find('Input').simulate('change', '0://world');
      const displayChatNames = renderedConversations(wrapper).map((c) => c.name);
      expect(displayChatNames).toStrictEqual([
        'convo-1',
        'convo-2',
        'convo-3',
        'convo-4',
        'user1 and user2',
      ]);
    });

    it('filters conversations based on name and other members (direct match takes priority)', () => {
      const wrapper = subject({ conversations: conversations as any });

      wrapper.find('Input').simulate('change', 'user1');
      const displayChatNames = renderedConversations(wrapper).map((c) => c.name);
      expect(displayChatNames).toStrictEqual([
        'user1 and user2',
        'convo-4',
      ]);
    });

    it('filters archived conversations', () => {
      const archivedConversations = [
        stubConversation({ name: 'convo-1', unreadCount: { total: 0, highlight: 0 } }),
        stubConversation({
          name: 'convo-2',
          labels: [DefaultRoomLabels.ARCHIVED],
          unreadCount: { total: 0, highlight: 0 },
        }),
        stubConversation({
          name: 'convo-3',
          labels: [DefaultRoomLabels.ARCHIVED],
          unreadCount: { total: 0, highlight: 0 },
        }),
      ];
      const wrapper = subject({ conversations: archivedConversations as any });

      wrapper.find('Input').simulate('change', 'convo');
      const displayChatNames = renderedConversations(wrapper).map((c) => c.name);
      expect(displayChatNames).toStrictEqual(['convo-1']);
    });
  });

  it('selecting an existing conversation announces click event', async function () {
    const onConversationClick = jest.fn();
    const conversations = [
      { id: 'convo-id-2', name: '', otherMembers: [{ firstName: 'bob' }], unreadCount: { total: 0, highlight: 0 } },
    ] as any;
    const wrapper = subject({ conversations, onConversationClick });

    await searchFor(wrapper, 'bob');
    const filteredConversations = wrapper.find('ConversationItem');
    filteredConversations.at(0).simulate('click', 'convo-id-2');

    expect(onConversationClick).toHaveBeenCalledWith({ conversationId: 'convo-id-2' });
  });

  it('selecting an existing conversation clears the filtered state', async function () {
    const onConversationClick = jest.fn();
    const conversations = [
      { id: 'convo-id-2', name: '', otherMembers: [{ firstName: 'bob' }], unreadCount: { total: 0, highlight: 0 } },
      { id: 'convo-id-2', name: '', otherMembers: [{ firstName: 'jack' }], unreadCount: { total: 0, highlight: 0 } },
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
      { value: 'user-1', label: 'jack', image: 'image-1', subLabel: '' },
      { value: 'user-3', label: 'jacklyn', image: 'image-3', subLabel: '' },
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

  it('scrollToTop is called when search result is changed', async function () {
    const wrapper: any = subject({});
    wrapper.instance().scrollContainerRef = {
      current: {
        scrollToTop: jest.fn(),
      },
    } as any;

    // Simulate a search query change
    await searchFor(wrapper, 'bob');

    // Ensure scrollToTop is called
    const scrollContainerRef = wrapper.instance().scrollContainerRef;
    expect(scrollContainerRef.current.scrollToTop).toHaveBeenCalled();

    // Simulate a search query change (from 'bob' to '')
    await searchFor(wrapper, '');
    expect(scrollContainerRef.current.scrollToTop).toHaveBeenCalled();
  });
});

function tabNamed(wrapper, tabName: string) {
  return wrapper.find('.messages-list__tab').filterWhere((n) => n.childAt(0).text().trim() === tabName);
}

function selectTab(wrapper, tabName: string) {
  tabNamed(wrapper, tabName).simulate('click');
}

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

function renderedConversationNames(wrapper) {
  return renderedConversations(wrapper).map((c) => c.name);
}
