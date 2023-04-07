import React from 'react';
import { shallow } from 'enzyme';
import { Container as DirectMessageChat, Properties } from '.';
import { normalize } from '../../../store/channels-list';
import { RootState } from '../../../store';
import moment from 'moment';
import { when } from 'jest-when';
import CreateConversationPanel from './create-conversation-panel';
import { ConversationListPanel } from './conversation-list-panel';
import { StartGroupPanel } from './start-group-panel';
import { GroupDetailsPanel } from './group-details-panel';

const mockSearchMyNetworksByName = jest.fn();
jest.mock('../../../platform-apps/channels/util/api', () => {
  return { searchMyNetworksByName: async (...args) => await mockSearchMyNetworksByName(...args) };
});

const mockFetchConversationsWithUsers = jest.fn();
jest.mock('../../../store/channels-list/api', () => {
  return { fetchConversationsWithUsers: async (...args) => mockFetchConversationsWithUsers(...args) };
});

describe('messenger-list', () => {
  const subject = (props: Partial<Properties> = {}) => {
    const allProps: Properties = {
      userId: '',
      conversations: [],
      isCreateConversationActive: false,
      isGroupCreating: false,
      setActiveMessengerChat: jest.fn(),
      fetchConversations: jest.fn(),
      createConversation: jest.fn(),
      channelsReceived: jest.fn(),
      onClose: () => null,
      ...props,
    };

    return shallow(<DirectMessageChat {...allProps} />);
  };

  it('render direct message members', function () {
    const wrapper = subject({});

    expect(wrapper.find('.direct-message-members').exists()).toBe(true);
  });

  it('start sync direct messages', function () {
    const fetchConversations = jest.fn();

    subject({ fetchConversations });

    expect(fetchConversations).toHaveBeenCalledOnce();
  });

  it('publishes close event when titlebar X clicked', function () {
    const onClose = jest.fn();

    const wrapper = subject({ onClose });

    wrapper.find('.messenger-list__header button').simulate('click');

    expect(onClose).toHaveBeenCalledOnce();
  });

  it('searches for citizens when creating a new conversation', async function () {
    when(mockSearchMyNetworksByName)
      .calledWith('jac')
      .mockResolvedValue([{ id: 'user-id', profileImage: 'image-url' }]);
    const wrapper = subject({});
    openCreateConversation(wrapper);

    const searchResults = await wrapper.find(CreateConversationPanel).prop('search')('jac');

    expect(searchResults).toStrictEqual([{ id: 'user-id', image: 'image-url', profileImage: 'image-url' }]);
  });

  it('creates a one on one conversation when user selected', async function () {
    const createConversation = jest.fn();
    const wrapper = subject({ createConversation });
    openCreateConversation(wrapper);

    wrapper.find(CreateConversationPanel).prop('onCreate')('selected-user-id');

    expect(createConversation).toHaveBeenCalledWith({ userIds: ['selected-user-id'] });
  });

  it('returns to conversation list when one on one conversation created', async function () {
    const createConversation = jest.fn();
    const wrapper = subject({ createConversation });
    openCreateConversation(wrapper);

    wrapper.find(CreateConversationPanel).simulate('create', 'selected-user-id');

    expect(wrapper).not.toHaveElement('CreateConversationPanel');
    expect(wrapper).toHaveElement('ConversationListPanel');
  });

  it('returns to conversation list if back button pressed', async function () {
    const wrapper = subject({});
    openCreateConversation(wrapper);
    expect(wrapper).toHaveElement('CreateConversationPanel');
    expect(wrapper).not.toHaveElement('ConversationListPanel');

    wrapper.find(CreateConversationPanel).prop('onBack')();

    expect(wrapper).not.toHaveElement('CreateConversationPanel');
    expect(wrapper).toHaveElement('ConversationListPanel');
  });

  it('creates a group conversation when users selected and conversation already exists', async function () {
    const setActiveMessengerChat = jest.fn();
    when(mockFetchConversationsWithUsers)
      .calledWith([
        'current-user-id',
        'selected-id-1',
        'selected-id-2',
      ])
      .mockResolvedValue([
        { id: 'convo-1' },
        { id: 'convo-2' },
      ]);
    const wrapper = subject({ userId: 'current-user-id', setActiveMessengerChat });
    openCreateConversation(wrapper);
    openStartGroup(wrapper);

    await wrapper.find(StartGroupPanel).prop('onContinue')([
      { value: 'selected-id-1' } as any,
      { value: 'selected-id-2' } as any,
    ]);

    expect(setActiveMessengerChat).toHaveBeenCalledWith('convo-1');
  });

  it('sets StartGroupPanel to Continuing while data is loading', async function () {
    const fetchPromise = new Promise((_r) => null); // Never resolve
    when(mockFetchConversationsWithUsers).mockReturnValue(fetchPromise);
    const wrapper = subject({});
    openCreateConversation(wrapper);
    openStartGroup(wrapper);

    wrapper.find(StartGroupPanel).prop('onContinue')([{} as any]);
    expect(wrapper.find(StartGroupPanel).prop('isContinuing')).toBeTrue();
  });

  it('adds the existing conversations to the store if there are any', async function () {
    const channelsReceived = jest.fn();
    when(mockFetchConversationsWithUsers).mockResolvedValue([{ id: 'convo-1' }]);
    const wrapper = subject({ channelsReceived });
    openCreateConversation(wrapper);
    openStartGroup(wrapper);

    await wrapper.find(StartGroupPanel).prop('onContinue')([{ value: 'selected-id-1' } as any]);

    expect(channelsReceived).toHaveBeenCalledWith({ channels: [{ id: 'convo-1' }] });
  });

  it('moves to the group details phase if no conversation exists for users', async function () {
    when(mockFetchConversationsWithUsers).mockResolvedValue([]);
    const wrapper = subject();

    openCreateConversation(wrapper);
    openStartGroup(wrapper);
    await wrapper.find(StartGroupPanel).prop('onContinue')([{ value: 'id-1' } as any]);

    expect(wrapper).not.toHaveElement(ConversationListPanel);
    expect(wrapper).not.toHaveElement(CreateConversationPanel);
    expect(wrapper).not.toHaveElement(StartGroupPanel);
    expect(wrapper).toHaveElement('GroupDetailsPanel');
  });

  it('creates a group conversation when details submitted', async function () {
    const createConversation = jest.fn();
    const wrapper = subject({ createConversation });
    openCreateConversation(wrapper);
    openStartGroup(wrapper);
    await wrapper.find(StartGroupPanel).prop('onContinue')([{ value: 'id-1' } as any]);

    wrapper
      .find(GroupDetailsPanel)
      .simulate('create', { name: 'group name', users: [{ value: 'id-1' }], image: { some: 'image' } });

    expect(createConversation).toHaveBeenCalledWith({
      name: 'group name',
      userIds: ['id-1'],
      image: { some: 'image' },
    });
  });

  it('maintains the selected users on StartGroup phase if back button pressed on group details panel', async function () {
    const wrapper = subject({});
    openCreateConversation(wrapper);
    openStartGroup(wrapper);
    await wrapper.find(StartGroupPanel).prop('onContinue')([{ value: 'user-id' } as any]);

    wrapper.find(GroupDetailsPanel).simulate('back');

    expect(wrapper.find(StartGroupPanel).prop('initialSelections')).toEqual([{ value: 'user-id' }]);
  });

  it('clears the selected users if moving back from StartGroup', async function () {
    const wrapper = subject({});
    openCreateConversation(wrapper);
    openStartGroup(wrapper);

    // Select some users
    await wrapper.find(StartGroupPanel).prop('onContinue')([{ value: 'user-id' } as any]);
    // Navigate back to the Create panel
    wrapper.find(GroupDetailsPanel).simulate('back');
    wrapper.find(StartGroupPanel).simulate('back');

    // Open the start group again
    openStartGroup(wrapper);

    expect(wrapper.find(StartGroupPanel).prop('initialSelections')).toEqual([]);
  });

  it('sets the group details props', async function () {
    const wrapper = subject({ isGroupCreating: true });
    openCreateConversation(wrapper);
    openStartGroup(wrapper);
    await wrapper.find(StartGroupPanel).prop('onContinue')([{ value: 'user-id' } as any]);

    expect(wrapper.find(GroupDetailsPanel).props()).toEqual(
      expect.objectContaining({
        users: [{ value: 'user-id' }],
        isCreating: true,
      })
    );
  });

  describe('navigation', () => {
    it('moves to the group conversation creation phase', function () {
      const wrapper = subject({});
      openCreateConversation(wrapper);

      openStartGroup(wrapper);

      expect(wrapper).not.toHaveElement(ConversationListPanel);
      expect(wrapper).not.toHaveElement(CreateConversationPanel);
      expect(wrapper).toHaveElement('StartGroupPanel');
    });

    it('returns to one on one conversation panel if back button pressed on start group panel', async function () {
      const wrapper = subject({});
      openCreateConversation(wrapper);
      openStartGroup(wrapper);

      wrapper.find(StartGroupPanel).prop('onBack')();

      expect(wrapper).not.toHaveElement(StartGroupPanel);
      expect(wrapper).toHaveElement(CreateConversationPanel);
      expect(wrapper).not.toHaveElement(ConversationListPanel);
    });

    it('returns to conversation list when group conversation created from StartGroup stage', async function () {
      const createConversation = jest.fn();
      when(mockFetchConversationsWithUsers).mockResolvedValue([{ id: 'convo' }]);
      const wrapper = subject({ createConversation });
      openCreateConversation(wrapper);
      openStartGroup(wrapper);

      await wrapper.find(StartGroupPanel).prop('onContinue')([{ value: 'selected-id-1' } as any]);

      expect(wrapper).toHaveElement(ConversationListPanel);
      expect(wrapper).not.toHaveElement(CreateConversationPanel);
      expect(wrapper).not.toHaveElement(StartGroupPanel);
    });

    it('returns to the StartGroup phase if back button pressed on group details panel', async function () {
      const wrapper = subject({});
      openCreateConversation(wrapper);
      openStartGroup(wrapper);
      await openGroupDetails(wrapper);

      wrapper.find(GroupDetailsPanel).simulate('back');

      expect(wrapper).not.toHaveElement(ConversationListPanel);
      expect(wrapper).not.toHaveElement(CreateConversationPanel);
      expect(wrapper).toHaveElement('StartGroupPanel');
      expect(wrapper).not.toHaveElement('GroupDetailsPanel');
    });
  });

  describe('mapState', () => {
    const subject = (channels, createConversationState = {}) => {
      return DirectMessageChat.mapState(getState(channels, createConversationState));
    };

    const getState = (channels, createConversationState = {}) => {
      const channelData = normalize(channels);
      return {
        authentication: {},
        channelsList: { value: channelData.result },
        normalized: channelData.entities,
        createConversation: {
          groupDetails: {},
          ...createConversationState,
        },
      } as RootState;
    };

    test('gets sorted conversations', () => {
      const state = subject([
        { id: 'convo-1', lastMessage: { createdAt: moment('2023-03-01').valueOf() }, isChannel: false },
        { id: 'convo-2', lastMessage: { createdAt: moment('2023-03-02').valueOf() }, isChannel: false },
      ]);

      expect(state.conversations.map((c) => c.id)).toEqual([
        'convo-2',
        'convo-1',
      ]);
    });

    test('gets only conversations', () => {
      const state = subject([
        { id: 'convo-1', isChannel: false },
        { id: 'convo-2', isChannel: true },
        { id: 'convo-3', isChannel: false },
      ]);

      expect(state.conversations.map((c) => c.id)).toEqual([
        'convo-1',
        'convo-3',
      ]);
    });

    test('create conversation active status', () => {
      const state = subject([], {
        isActive: true,
      });

      expect(state.isCreateConversationActive).toEqual(true);
    });

    test('gets group details from state', () => {
      const state = subject([], {
        groupDetails: {
          isCreating: true,
        },
      });

      expect(state.isGroupCreating).toEqual(true);
    });
  });
});

async function openGroupDetails(wrapper) {
  // Call the property directly because it's async
  await wrapper.find(StartGroupPanel).prop('onContinue')([{ id: 'fake-id' }]);
}

function openStartGroup(wrapper) {
  wrapper.find(CreateConversationPanel).simulate('startGroupChat');
}

function openCreateConversation(wrapper) {
  wrapper.find(ConversationListPanel).prop('startConversation')();
}
