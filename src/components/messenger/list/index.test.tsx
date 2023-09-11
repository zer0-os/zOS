import { shallow } from 'enzyme';
import { Container as DirectMessageChat, Properties } from '.';
import { normalize } from '../../../store/channels-list';
import { normalize as normalizeUsers } from '../../../store/users';
import { RootState } from '../../../store/reducer';
import moment from 'moment';
import { when } from 'jest-when';
import CreateConversationPanel from './create-conversation-panel';
import { ConversationListPanel } from './conversation-list-panel';
import { StartGroupPanel } from './start-group-panel';
import { GroupDetailsPanel } from './group-details-panel';
import { Stage } from '../../../store/create-conversation';
import { RegistrationState } from '../../../store/registration';
import { LayoutState } from '../../../store/layout/types';
import { RewardsState } from '../../../store/rewards';
import { RewardsBar } from '../../rewards-bar';
import { previewDisplayDate } from '../../../lib/chat/chat-message';

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
      isFirstTimeLogin: false,
      includeTitleBar: true,
      allowClose: true,
      allowExpand: true,
      includeRewardsAvatar: false,
      isMessengerFullScreen: false,
      userName: '',
      userHandle: '',
      userAvatarUrl: '',
      zeroPreviousDay: '',
      isRewardsLoading: false,
      isInviteNotificationOpen: false,
      myUserId: '',
      showRewardsInTooltip: false,
      showRewardsInPopup: false,
      openConversation: jest.fn(),
      fetchConversations: jest.fn(),
      createConversation: jest.fn(),
      markConversationAsRead: jest.fn(),
      startCreateConversation: () => null,
      membersSelected: () => null,
      startGroup: () => null,
      back: () => null,
      onClose: () => null,
      enterFullScreenMessenger: () => null,
      fetchRewards: () => null,
      rewardsPopupClosed: () => null,
      rewardsTooltipClosed: () => null,
      receiveSearchResults: () => null,
      logout: () => null,
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

    wrapper.find('.messenger-list__header button').at(1).simulate('click');

    expect(onClose).toHaveBeenCalledOnce();
  });

  it('starts create conversation saga', async function () {
    const startCreateConversation = jest.fn();
    const wrapper = subject({ startCreateConversation });

    wrapper.find(ConversationListPanel).prop('startConversation')();

    expect(startCreateConversation).toHaveBeenCalledOnce();
  });

  it('renders RewardsBar when stage is equal to none', function () {
    const wrapper = subject({ stage: Stage.None });

    expect(wrapper).toHaveElement(RewardsBar);
  });

  it('does not render RewardsBar when stage is not equal to none', function () {
    const wrapper = subject({ stage: Stage.CreateOneOnOne });

    expect(wrapper).not.toHaveElement(RewardsBar);
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

  it('renders the title bar based on property', function () {
    const wrapper = subject({ includeTitleBar: true });
    expect(wrapper).toHaveElement('.messenger-list__header');

    wrapper.setProps({ includeTitleBar: false });
    expect(wrapper).not.toHaveElement('.messenger-list__header');
  });

  it('renders the close icon as necessary', function () {
    const wrapper = subject({ allowClose: true });
    expect(wrapper).toHaveElement('IconXClose');

    wrapper.setProps({ allowClose: false });
    expect(wrapper).not.toHaveElement('IconXClose');
  });

  it('renders the expand icon as necessary', function () {
    const wrapper = subject({ allowExpand: true });
    expect(wrapper).toHaveElement('IconExpand1');

    wrapper.setProps({ allowExpand: false });
    expect(wrapper).not.toHaveElement('IconExpand1');
  });

  it('opens full screen mode', function () {
    const enterFullScreenMessenger = jest.fn();
    const wrapper = subject({ enterFullScreenMessenger, allowExpand: true });

    wrapper.find('.messenger-list__icon-button').at(0).simulate('click');

    expect(enterFullScreenMessenger).toHaveBeenCalledOnce();
  });

  describe('mapState', () => {
    const subject = (
      channels,
      createConversationState = {},
      currentUser = [{ userId: '', firstName: '', isAMemberOfWorlds: true }],
      chat = { activeConversationId: '' },
      rewardsState = {}
    ) => {
      return DirectMessageChat.mapState(getState(channels, createConversationState, currentUser, chat, rewardsState));
    };

    const getState = (
      channels,
      createConversationState = {},
      users = [{ userId: '', isAMemberOfWorlds: true }],
      chat = { activeConversationId: '' },
      rewardsState: Partial<RewardsState> = {}
    ) => {
      const channelData = normalize(channels);
      const userData = normalizeUsers(users);
      return {
        authentication: {
          user: {
            data: {
              id: users[0].userId,
              isAMemberOfWorlds: users[0].isAMemberOfWorlds,
            },
          },
        },
        chat,
        channelsList: { value: channelData.result },
        normalized: {
          ...userData.entities,
          ...channelData.entities,
        } as any,
        createConversation: {
          startGroupChat: {},
          groupDetails: {},
          ...createConversationState,
        },
        registration: {},
        rewards: {
          loading: false,
          ...rewardsState,
        },
      } as RootState;
    };

    test('gets sorted conversations', () => {
      const state = subject([
        { id: 'convo-1', lastMessage: { createdAt: moment('2023-03-03').valueOf(), sender: {} }, isChannel: false },
        { id: 'convo-2', lastMessage: { createdAt: moment('2023-03-01').valueOf(), sender: {} }, isChannel: false },
        { id: 'convo-3', createdAt: moment('2023-03-04').valueOf(), isChannel: false },
        {
          id: 'convo-4',
          createdAt: moment('2023-03-05').valueOf(),
          lastMessage: { createdAt: moment('2023-03-02').valueOf(), sender: {} },
          isChannel: false,
        },
      ]);

      expect(state.conversations.map((c) => c.id)).toEqual([
        'convo-3',
        'convo-1',
        'convo-4',
        'convo-2',
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

    describe('messagePreview', () => {
      it('sets the preview for all conversations', () => {
        const state = subject([
          {
            id: 'convo-1',
            lastMessage: { message: 'The last message', sender: { firstName: 'Jack' } },
            isChannel: false,
          },
          {
            id: 'convo-2',
            lastMessage: { message: 'Second message last', sender: { firstName: 'Jack' } },
            isChannel: false,
          },
        ]);

        expect(state.conversations.map((c) => c.messagePreview)).toEqual([
          'Jack: The last message',
          'Jack: Second message last',
        ]);
      });

      it('uses most recent of last message in list or lastMessage on conversation', () => {
        const state = subject([
          {
            id: 'convo-1',
            lastMessage: { message: 'lastMessage', createdAt: 10003, sender: { firstName: 'Jack' } },
            messages: [
              { id: '1', message: 'recent message', createdAt: 10005, sender: { firstName: 'Jack' } },
              { id: '2', message: 'old message', createdAt: 10002 },
            ],
            isChannel: false,
          },
          {
            id: 'convo-2',
            lastMessage: { message: 'lastMessage', createdAt: 20007, sender: { firstName: 'Jack' } },
            messages: [],
            isChannel: false,
          },
        ]);

        expect(state.conversations.map((c) => c.messagePreview)).toEqual([
          'Jack: lastMessage',
          'Jack: recent message',
        ]);
      });
    });

    test('previewDisplayDate', () => {
      const date = moment('2023-03-03').valueOf();
      const state = subject([
        {
          id: 'convo-1',
          lastMessage: { createdAt: date, message: '', sender: {} },
          isChannel: false,
        },
      ]);

      expect(state.conversations.map((c) => c.previewDisplayDate)).toEqual([previewDisplayDate(date)]);
    });

    test('isLoading', () => {
      const state = subject([], {}, undefined, undefined, { loading: true });

      expect(state.isRewardsLoading).toEqual(true);
    });

    test('activeConversationId', () => {
      const state = subject([], {}, undefined, { activeConversationId: 'active-channel-id' });

      expect(state.activeConversationId).toEqual('active-channel-id');
    });

    test('stage', () => {
      const state = subject([], { stage: Stage.GroupDetails });

      expect(state.stage).toEqual(Stage.GroupDetails);
    });

    test('groupUsers', () => {
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

    test('isFirstTimeLogin', async () => {
      const state = DirectMessageChat.mapState({
        ...getState([]),
        registration: { isFirstTimeLogin: true } as RegistrationState,
      });

      expect(state.isFirstTimeLogin).toEqual(true);
    });

    test('includeTitleBar', async () => {
      let state = DirectMessageChat.mapState({
        ...getState([]),
        layout: { value: { isMessengerFullScreen: true } } as LayoutState,
      });
      expect(state.includeTitleBar).toEqual(false);

      state = DirectMessageChat.mapState({
        ...getState([]),
        layout: { value: { isMessengerFullScreen: false } } as LayoutState,
      });
      expect(state.includeTitleBar).toEqual(true);
    });

    test('allowClose', async () => {
      let state = DirectMessageChat.mapState({
        ...getState([]),
        layout: { value: { isMessengerFullScreen: true } } as LayoutState,
      });
      expect(state.allowClose).toEqual(false);

      state = DirectMessageChat.mapState({
        ...getState([]),
        layout: { value: { isMessengerFullScreen: false } } as LayoutState,
      });
      expect(state.allowClose).toEqual(true);
    });

    test('allowExpand', async () => {
      let state = DirectMessageChat.mapState({
        ...getState([]),
        layout: { value: { isMessengerFullScreen: true } } as LayoutState,
      });
      expect(state.allowExpand).toEqual(false);

      state = DirectMessageChat.mapState({
        ...getState([]),
        layout: { value: { isMessengerFullScreen: false } } as LayoutState,
      });
      expect(state.allowExpand).toEqual(true);
    });

    test('includeRewardsAvatar', async () => {
      let state = DirectMessageChat.mapState({
        ...getState([]),
        layout: { value: { isMessengerFullScreen: true } } as LayoutState,
      });
      expect(state.includeRewardsAvatar).toEqual(true);

      state = DirectMessageChat.mapState({
        ...getState([]),
        layout: { value: { isMessengerFullScreen: false } } as LayoutState,
      });
      expect(state.includeRewardsAvatar).toEqual(false);
    });
  });
});
