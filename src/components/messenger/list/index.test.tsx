import React from 'react';
import { shallow } from 'enzyme';
import { Container as DirectMessageChat, Properties } from '.';
import { normalize } from '../../../store/channels-list';
import { RootState } from '../../../store/reducer';
import moment from 'moment';
import { when } from 'jest-when';
import CreateConversationPanel from './create-conversation-panel';
import { ConversationListPanel } from './conversation-list-panel';
import { StartGroupPanel } from './start-group-panel';
import { GroupDetailsPanel } from './group-details-panel';
import { Stage } from '../../../store/create-conversation';

const mockSearchMyNetworksByName = jest.fn();
jest.mock('../../../platform-apps/channels/util/api', () => {
  return { searchMyNetworksByName: async (...args) => await mockSearchMyNetworksByName(...args) };
});

describe('messenger-list', () => {
  const subject = (props: Partial<Properties> = {}) => {
    const allProps: Properties = {
      stage: Stage.None,
      groupUsers: [],
      conversations: [],
      isFetchingExistingConversations: false,
      isGroupCreating: false,
      openConversation: jest.fn(),
      fetchConversations: jest.fn(),
      createConversation: jest.fn(),
      startCreateConversation: () => null,
      membersSelected: () => null,
      startGroup: () => null,
      back: () => null,
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

  it('starts create conversation saga', async function () {
    const startCreateConversation = jest.fn();
    const wrapper = subject({ startCreateConversation });

    wrapper.find(ConversationListPanel).prop('startConversation')();

    expect(startCreateConversation).toHaveBeenCalledOnce();
  });

  it('renders CreateConversationPanel', function () {
    const wrapper = subject({ stage: Stage.CreateOneOnOne });

    expect(wrapper).not.toHaveElement(ConversationListPanel);
    expect(wrapper).toHaveElement(CreateConversationPanel);
    expect(wrapper).not.toHaveElement(StartGroupPanel);
    expect(wrapper).not.toHaveElement(GroupDetailsPanel);
  });

  it('renders StartGroupPanel', function () {
    const wrapper = subject({ stage: Stage.StartGroupChat });

    expect(wrapper).not.toHaveElement(ConversationListPanel);
    expect(wrapper).not.toHaveElement(CreateConversationPanel);
    expect(wrapper).toHaveElement(StartGroupPanel);
    expect(wrapper).not.toHaveElement(GroupDetailsPanel);
  });

  it('renders GroupDetailsPanel', function () {
    const wrapper = subject({ stage: Stage.GroupDetails });

    expect(wrapper).not.toHaveElement(ConversationListPanel);
    expect(wrapper).not.toHaveElement(CreateConversationPanel);
    expect(wrapper).not.toHaveElement(StartGroupPanel);
    expect(wrapper).toHaveElement(GroupDetailsPanel);
  });

  it('moves starts group when group chat started', async function () {
    const startGroup = jest.fn();
    const wrapper = subject({ stage: Stage.CreateOneOnOne, startGroup });

    wrapper.find(CreateConversationPanel).simulate('startGroupChat');

    expect(startGroup).toHaveBeenCalledOnce();
  });

  it('moves back from CreateConversationPanel', async function () {
    const back = jest.fn();
    const wrapper = subject({ stage: Stage.CreateOneOnOne, back });

    await wrapper.find(CreateConversationPanel).simulate('back');

    expect(back).toHaveBeenCalledOnce();
  });

  it('moves back from StartGroupPanel', async function () {
    const back = jest.fn();
    const wrapper = subject({ stage: Stage.StartGroupChat, back });

    await wrapper.find(StartGroupPanel).simulate('back');

    expect(back).toHaveBeenCalledOnce();
  });

  it('moves back from GroupDetailsPanel', async function () {
    const back = jest.fn();
    const wrapper = subject({ stage: Stage.GroupDetails, back });

    await wrapper.find(GroupDetailsPanel).simulate('back');

    expect(back).toHaveBeenCalledOnce();
  });

  it('searches for citizens when creating a new conversation', async function () {
    when(mockSearchMyNetworksByName)
      .calledWith('jac')
      .mockResolvedValue([{ id: 'user-id', profileImage: 'image-url' }]);
    const wrapper = subject({ stage: Stage.CreateOneOnOne });

    const searchResults = await wrapper.find(CreateConversationPanel).prop('search')('jac');

    expect(searchResults).toStrictEqual([{ id: 'user-id', image: 'image-url', profileImage: 'image-url' }]);
  });

  it('creates a one on one conversation when user selected', async function () {
    const createConversation = jest.fn();
    const wrapper = subject({ createConversation, stage: Stage.CreateOneOnOne });

    wrapper.find(CreateConversationPanel).prop('onCreate')('selected-user-id');

    expect(createConversation).toHaveBeenCalledWith({ userIds: ['selected-user-id'] });
  });

  it('returns to conversation list if back button pressed', async function () {
    const back = jest.fn();
    const wrapper = subject({ stage: Stage.CreateOneOnOne, back });

    wrapper.find(CreateConversationPanel).prop('onBack')();

    expect(back).toHaveBeenCalledOnce();
  });

  it('sets StartGroupPanel to Continuing while data is loading', async function () {
    const wrapper = subject({ stage: Stage.StartGroupChat, isFetchingExistingConversations: true });

    expect(wrapper.find(StartGroupPanel).prop('isContinuing')).toBeTrue();
  });

  it('creates a group conversation when details submitted', async function () {
    const createConversation = jest.fn();
    const wrapper = subject({ createConversation, stage: Stage.StartGroupChat });
    await wrapper.find(StartGroupPanel).prop('onContinue')([{ value: 'id-1' } as any]);
    wrapper.setProps({ stage: Stage.GroupDetails });

    wrapper
      .find(GroupDetailsPanel)
      .simulate('create', { name: 'group name', users: [{ value: 'id-1' }], image: { some: 'image' } });

    expect(createConversation).toHaveBeenCalledWith({
      name: 'group name',
      userIds: ['id-1'],
      image: { some: 'image' },
    });
  });

  it('sets the start group props', async function () {
    const wrapper = subject({ stage: Stage.StartGroupChat, groupUsers: [{ value: 'user-id' } as any] });

    expect(wrapper.find(StartGroupPanel).prop('initialSelections')).toEqual([{ value: 'user-id' }]);
  });

  it('sets the group details props', async function () {
    const wrapper = subject({
      stage: Stage.GroupDetails,
      groupUsers: [{ value: 'user-id' } as any],
      isGroupCreating: true,
    });

    expect(wrapper.find(GroupDetailsPanel).props()).toEqual(
      expect.objectContaining({
        users: [{ value: 'user-id' }],
        isCreating: true,
      })
    );
  });

  describe('mapState', () => {
    const subject = (channels, createConversationState = {}) => {
      return DirectMessageChat.mapState(getState(channels, createConversationState));
    };

    const getState = (channels, createConversationState = {}) => {
      const channelData = normalize(channels);
      return {
        channelsList: { value: channelData.result },
        normalized: channelData.entities,
        createConversation: {
          startGroupChat: {},
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

    test('gets group details from state', () => {
      const state = subject([], {
        groupDetails: {
          isCreating: true,
        },
      });

      expect(state.isGroupCreating).toEqual(true);
    });

    test('messagePreview', () => {
      const state = subject([
        { id: 'convo-1', lastMessage: { message: 'The last message' }, isChannel: false },
        { id: 'convo-2', lastMessage: { message: 'Second message last' }, isChannel: false },
      ]);

      expect(state.conversations.map((c) => c.messagePreview)).toEqual([
        'The last message',
        'Second message last',
      ]);
    });

    test('stage', () => {
      const state = subject([], { stage: Stage.GroupDetails });

      expect(state.stage).toEqual(Stage.GroupDetails);
    });

    test('stage', () => {
      const state = subject([], { groupUsers: [{ value: 'a-thing' }] });

      expect(state.groupUsers).toEqual([{ value: 'a-thing' }]);
    });

    test('start group chat', () => {
      const state = subject([], {
        startGroupChat: {
          isLoading: true,
        },
      });

      expect(state.isFetchingExistingConversations).toEqual(true);
    });
  });
});
