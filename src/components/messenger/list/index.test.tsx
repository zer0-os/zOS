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
import { Stage as GroupManagementStage } from '../../../store/group-management';
import { RegistrationState } from '../../../store/registration';
import { previewDisplayDate } from '../../../lib/chat/chat-message';
import { GroupManagementContainer } from './group-management/container';
import { UserHeader } from './user-header';
import { ErrorDialog } from '../../error-dialog';
import { SecureBackupContainer } from '../../secure-backup/container';

const mockSearchMyNetworksByName = jest.fn();
jest.mock('../../../platform-apps/channels/util/api', () => {
  return { searchMyNetworksByName: async (...args) => await mockSearchMyNetworksByName(...args) };
});

describe('messenger-list', () => {
  const subject = (props: Partial<Properties> = {}) => {
    const allProps: Properties = {
      stage: Stage.None,
      groupManangemenetStage: GroupManagementStage.None,
      groupUsers: [],
      conversations: [],
      isFetchingExistingConversations: false,
      isFirstTimeLogin: false,
      userName: '',
      userHandle: '',
      userAvatarUrl: '',
      userIsOnline: true,
      myUserId: '',
      joinRoomErrorContent: null,
      onConversationClick: jest.fn(),
      createConversation: jest.fn(),
      isBackupDialogOpen: false,
      isRewardsDialogOpen: false,
      displayLogoutModal: false,
      showRewardsTooltip: false,
      closeConversationErrorDialog: () => null,
      startCreateConversation: () => null,
      membersSelected: () => null,
      startGroup: () => null,
      back: () => null,
      receiveSearchResults: () => null,
      logout: () => null,
      closeBackupDialog: () => null,
      closeRewardsDialog: () => null,
      onFavoriteRoom: () => null,
      onUnfavoriteRoom: () => null,

      ...props,
    };

    return shallow(<DirectMessageChat {...allProps} />);
  };

  it('render direct message members', function () {
    const wrapper = subject({});

    expect(wrapper.find('.direct-message-members').exists()).toBe(true);
  });

  it('starts create conversation saga', async function () {
    const startCreateConversation = jest.fn();
    const wrapper = subject({ startCreateConversation });

    wrapper.find(UserHeader).prop('startConversation')();

    expect(startCreateConversation).toHaveBeenCalledOnce();
  });

  it('renders user UserHeader when stage is equal to none', function () {
    const wrapper = subject({ stage: Stage.None });

    expect(wrapper).toHaveElement(UserHeader);
  });

  it('does not render UserHeader when stage is not equal to none', function () {
    const wrapper = subject({ stage: Stage.CreateOneOnOne });

    expect(wrapper).not.toHaveElement(UserHeader);
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

  it('renders GroupManagement if group management stage is NOT none', function () {
    const wrapper = subject({ stage: Stage.None, groupManangemenetStage: GroupManagementStage.StartAddMemberToRoom });

    expect(wrapper).toHaveElement(GroupManagementContainer);
  });

  it('does not render GroupManagement if group management stage is none', function () {
    const wrapper = subject({ stage: Stage.None, groupManangemenetStage: GroupManagementStage.None });

    expect(wrapper).not.toHaveElement(GroupManagementContainer);
  });

  it('renders Error Dialog Container if joinRoomErrorContent is set and not null', function () {
    const wrapper = subject({
      joinRoomErrorContent: { header: 'header', body: 'body' },
    });

    expect(wrapper).toHaveElement(ErrorDialog);
  });

  it('renders Secure Backup Dialog if isBackupDialogOpen', function () {
    const wrapper = subject({ isBackupDialogOpen: true });

    expect(wrapper).toHaveElement(SecureBackupContainer);
  });

  it('calls closeConversationErrorDialog when error dialog is closed', function () {
    const closeConversationErrorDialog = jest.fn();
    const wrapper = subject({
      joinRoomErrorContent: { header: 'header', body: 'body' },
      closeConversationErrorDialog,
    });

    wrapper.find(ErrorDialog).prop('onClose')();

    expect(closeConversationErrorDialog).toHaveBeenCalledOnce();
  });

  describe('usersInMyNetworks', () => {
    const myUserId = 'my-user-id';
    const mockSearchResults = [
      { id: 'user-1', name: 'Jack', profileImage: 'image-url-1' },
      { id: myUserId, name: 'Janet', profileImage: 'image-url-2' }, // Current user
      { id: 'user-3', name: 'Jake', profileImage: 'image-url-3' },
    ];

    const stages = [
      { stage: Stage.None, component: ConversationListPanel, searchProp: 'search' },
      { stage: Stage.CreateOneOnOne, component: CreateConversationPanel, searchProp: 'search' },
      { stage: Stage.StartGroupChat, component: StartGroupPanel, searchProp: 'searchUsers' },
    ];

    stages.forEach(({ stage, component, searchProp }) => {
      it(`excludes the current user from search results in stage: ${stage}`, async () => {
        when(mockSearchMyNetworksByName).calledWith('Ja').mockResolvedValue(mockSearchResults);

        const wrapper = subject({
          stage: stage,
          myUserId: myUserId,
        });

        const searchResults = await wrapper.find(component).prop(searchProp)('Ja');

        expect(searchResults).toEqual(expect.not.arrayContaining([{ id: myUserId }]));
        expect(searchResults).toEqual([
          { id: 'user-1', name: 'Jack', image: 'image-url-1', profileImage: 'image-url-1' },
          { id: 'user-3', name: 'Jake', image: 'image-url-3', profileImage: 'image-url-3' },
        ]);
      });
    });
  });

  describe('mapState', () => {
    const subject = (
      channels,
      createConversationState = {},
      currentUser = [{ userId: '', firstName: '', isAMemberOfWorlds: true }],
      chat = { activeConversationId: '', joinRoomErrorContent: null }
    ) => {
      return DirectMessageChat.mapState(getState(channels, createConversationState, currentUser, chat));
    };

    const getState = (
      channels,
      createConversationState = {},
      users = [{ userId: '', isAMemberOfWorlds: true }],
      chat = { activeConversationId: '' }
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
        groupManagement: {},
        matrix: {},
        rewards: {},
      } as RootState;
    };

    test('gets sorted conversations', () => {
      const state = subject([
        { id: 'convo-1', lastMessage: { createdAt: moment('2023-03-03').valueOf(), sender: {} } },
        { id: 'convo-2', lastMessage: { createdAt: moment('2023-03-01').valueOf(), sender: {} } },
        { id: 'convo-3', createdAt: moment('2023-03-04').valueOf() },
        {
          id: 'convo-4',
          createdAt: moment('2023-03-05').valueOf(),
          lastMessage: { createdAt: moment('2023-03-02').valueOf(), sender: {} },
        },
      ]);

      expect(state.conversations.map((c) => c.id)).toEqual([
        'convo-3',
        'convo-1',
        'convo-4',
        'convo-2',
      ]);
    });

    describe('messagePreview', () => {
      it('sets the preview for all conversations', () => {
        const state = subject([
          {
            id: 'convo-1',
            lastMessage: { message: 'The last message', sender: { firstName: 'Jack' } },
          },
          {
            id: 'convo-2',
            lastMessage: { message: 'Second message last', sender: { firstName: 'Jack' } },
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
          },
          {
            id: 'convo-2',
            lastMessage: { message: 'lastMessage', createdAt: 20007, sender: { firstName: 'Jack' } },
            messages: [],
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
        },
      ]);

      expect(state.conversations.map((c) => c.previewDisplayDate)).toEqual([previewDisplayDate(date)]);
    });

    test('activeConversationId', () => {
      const state = subject([], {}, undefined, {
        activeConversationId: 'active-channel-id',
        joinRoomErrorContent: null,
      });

      expect(state.activeConversationId).toEqual('active-channel-id');
    });

    test('joinRoomErrorContent', () => {
      const state = subject([], {}, undefined, {
        activeConversationId: 'active-channel-id',
        joinRoomErrorContent: { header: 'header', body: 'body' },
      });

      expect(state.joinRoomErrorContent).toEqual({ header: 'header', body: 'body' });
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
  });
});
